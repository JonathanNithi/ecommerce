package catalog

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/JonathanNithi/ecommerce/backend/catalog/pb"
	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esapi"
)

var (
	ErrNotFound = errors.New("entity not found")
	indexName   = "catalog"
)

type Repository interface {
	Close()
	PutProduct(ctx context.Context, p Product) error
	GetProductByID(ctx context.Context, id string) (*Product, error)
	ListProducts(ctx context.Context, skip uint64, take uint64, sort *pb.ProductSortInput) ([]Product, error)
	ListProductsWithIDs(ctx context.Context, ids []string) ([]Product, error)
	SearchProducts(ctx context.Context, query string, skip uint64, take uint64, category string, sort *pb.ProductSortInput) ([]Product, error)
	DeductStock(ctx context.Context, id string, newStock int64) error
}

type elasticRepository struct {
	client *elasticsearch.Client
}

type productDocument struct {
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Price        float64  `json:"price"`
	Category     string   `json:"category"`
	ImageURL     string   `json:"image_url"`
	Tags         []string `json:"tags"`
	Availability bool     `json:"availability"`
	Stock        int64    `json:"stock"`
}

func NewElasticRepository(url string) (Repository, error) {
	cfg := elasticsearch.Config{
		Addresses:     []string{url},
		RetryOnStatus: []int{502, 503, 504, 429},
		RetryBackoff:  func(i int) time.Duration { return time.Duration(i) * 100 * time.Millisecond },
		MaxRetries:    5,
	}
	client, err := elasticsearch.NewClient(cfg)
	if err != nil {
		return nil, fmt.Errorf("error creating Elasticsearch client: %w", err)
	}

	// Add a short timeout context for initialization steps
	initCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if the index exists
	existsReq := esapi.IndicesExistsRequest{
		Index: []string{indexName},
	}

	res, err := existsReq.Do(initCtx, client)
	if err != nil {
		return nil, fmt.Errorf("error checking if index '%s' exists: %w", indexName, err)
	}
	// Defer closing the response body *after* checking for nil
	if res != nil {
		defer res.Body.Close()
	}

	// If the index doesn't exist (404 Not Found), create it
	if res.StatusCode == 404 {
		log.Printf("Index '%s' not found, attempting to create...", indexName)

		createBody := strings.NewReader(fmt.Sprintf(`{
			"settings": {
				"number_of_shards": 1,
				"number_of_replicas": 0
			},
			"mappings": {
				"properties": {
					"name": {
						"type": "text",
						"fields": {
							"keyword": {
								"type": "keyword",
								"ignore_above": 256
							},
							"enum": {
								"type": "keyword",
								"ignore_above": 256
							}
						}
					},
					"description": { "type": "text" },
					"price": { "type": "float" },
					"category": { "type": "keyword" },
					"imageURL": { "type": "keyword" },
					"tags": { "type": "keyword" },
					"availability": { "type": "boolean" },
					"stock": { "type": "integer" }
				}
			}
		}`))

		// Simple creation without specific mappings/settings:
		createReq := esapi.IndicesCreateRequest{
			Index: indexName,
			Body:  createBody,
		}

		createRes, err := createReq.Do(initCtx, client)
		if err != nil {
			return nil, fmt.Errorf("error creating index '%s': %w", indexName, err)
		}
		if createRes != nil {
			defer createRes.Body.Close()
		}

		if createRes.IsError() {
			return nil, fmt.Errorf("error response during index '%s' creation: %s", indexName, createRes.String())
		}
		log.Printf("Index '%s' created successfully.", indexName)

	} else if res.IsError() {
		// Handle other errors during the existence check
		return nil, fmt.Errorf("error checking index '%s' existence: %s", indexName, res.String())
	} else {
		// Index already exists
		log.Printf("Index '%s' already exists.", indexName)
	}

	return &elasticRepository{client}, nil
}

func (r *elasticRepository) Close() {
	// The Elasticsearch client does not require explicit closing.
}

func (r *elasticRepository) PutProduct(ctx context.Context, p Product) error {
	// Step 1: Check for existing product with the same name (case-insensitive)
	searchQuery := map[string]interface{}{
		"query": map[string]interface{}{
			"term": map[string]interface{}{
				"name.enum": p.Name, // Normalize the query term
			},
		},
		"size": 1,
	}

	queryJSON, err := json.Marshal(searchQuery)
	if err != nil {
		return fmt.Errorf("error marshaling search query: %v", err)
	}

	searchReq := esapi.SearchRequest{
		Index: []string{"catalog"},
		Body:  strings.NewReader(string(queryJSON)),
	}

	res, err := searchReq.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("error executing search request: %v", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("error searching for existing product: status=%s, response=%s", res.Status(), res.String())
	}

	var result map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return fmt.Errorf("error decoding search response: %v", err)
	}

	hits := result["hits"].(map[string]interface{})["hits"].([]interface{})
	if len(hits) > 0 {
		return fmt.Errorf("product with the same name '%s' already exists", p.Name)
	}

	// Step 2: Index the new product
	doc := productDocument{
		Name:         p.Name,
		Description:  p.Description,
		Price:        p.Price,
		Category:     p.Category,
		ImageURL:     p.ImageURL,
		Tags:         p.Tags,
		Availability: p.Availability,
		Stock:        int64(p.Stock),
	}
	docJSON, err := json.Marshal(doc)
	if err != nil {
		return fmt.Errorf("error marshaling product document: %v", err)
	}

	indexReq := esapi.IndexRequest{
		Index:      "catalog",
		DocumentID: p.ID,
		Body:       strings.NewReader(string(docJSON)),
		Refresh:    "true",
	}

	res, err = indexReq.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("error executing index request: %v", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("error indexing document: status=%s, response=%s", res.Status(), res.String())
	}

	return nil
}

func (r *elasticRepository) GetProductByID(ctx context.Context, id string) (*Product, error) {
	// Step 1: Create a GetRequest to fetch the document by ID
	req := esapi.GetRequest{
		Index:      "catalog",
		DocumentID: id,
	}

	// Step 2: Execute the request
	res, err := req.Do(ctx, r.client)
	if err != nil {
		return nil, fmt.Errorf("error executing GetRequest: %v", err)
	}
	defer res.Body.Close()

	// Step 3: Handle errors (e.g., document not found)
	if res.IsError() {
		if res.StatusCode == 404 {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("error fetching document: %s", res.String())
	}

	// Step 4: Parse the response body
	var getResponse struct {
		Source productDocument `json:"_source"`
	}
	if err := json.NewDecoder(res.Body).Decode(&getResponse); err != nil {
		return nil, fmt.Errorf("error decoding response body: %v", err)
	}

	// Step 5: Log the product details (for debugging)
	log.Println(getResponse.Source)

	// Step 6: Map the productDocument to the Product struct
	return &Product{
		ID:           id,
		Name:         getResponse.Source.Name,
		Description:  getResponse.Source.Description,
		Price:        getResponse.Source.Price,
		Category:     getResponse.Source.Category,
		ImageURL:     getResponse.Source.ImageURL,
		Tags:         getResponse.Source.Tags,
		Availability: getResponse.Source.Availability,
		Stock:        getResponse.Source.Stock,
	}, nil
}

func (r *elasticRepository) ListProducts(ctx context.Context, skip, take uint64, sort *pb.ProductSortInput) ([]Product, error) {
	query := map[string]interface{}{
		"from": skip,
		"size": take,
		"query": map[string]interface{}{
			"match_all": map[string]interface{}{},
		},
	}
	if sort != nil {
		log.Printf("ListProducts called with Sort Field: %s, Direction: %s", sort.Field, sort.Direction)
	} else {
		log.Println("ListProducts called with nil sort parameter.")
	}
	if sort != nil {
		sortField := ""
		switch sort.Field {
		case pb.ProductSortField_NAME:
			sortField = "name.keyword"
		case pb.ProductSortField_PRICE:
			sortField = "price"
		default:
			sortField = "_id"
		}

		sortDirection := "asc"
		if sort.Direction == pb.SortDirection_DESC {
			sortDirection = "desc"
		}

		query["sort"] = []map[string]interface{}{
			{
				sortField: map[string]interface{}{
					"order": sortDirection,
				},
			},
		}
	}

	queryJSON, err := json.Marshal(query)
	if err != nil {
		return nil, err
	}

	req := esapi.SearchRequest{
		Index: []string{"catalog"},
		Body:  strings.NewReader(string(queryJSON)),
	}

	res, err := req.Do(ctx, r.client)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("error searching documents: %s", res.String())
	}

	var result map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}

	products := []Product{}
	hits := result["hits"].(map[string]interface{})["hits"].([]interface{})
	for _, hit := range hits {
		source := hit.(map[string]interface{})["_source"]
		sourceJSON, err := json.Marshal(source)
		if err != nil {
			return nil, err
		}

		var p productDocument
		if err := json.Unmarshal(sourceJSON, &p); err != nil {
			return nil, err
		}

		products = append(products, Product{
			ID:           hit.(map[string]interface{})["_id"].(string),
			Name:         p.Name,
			Description:  p.Description,
			Price:        p.Price,
			Category:     p.Category,
			ImageURL:     p.ImageURL,
			Tags:         p.Tags,
			Availability: p.Availability,
			Stock:        p.Stock,
		})
	}

	return products, nil
}

func (r *elasticRepository) ListProductsWithIDs(ctx context.Context, ids []string) ([]Product, error) {
	query := map[string]interface{}{
		"query": map[string]interface{}{
			"ids": map[string]interface{}{
				"values": ids,
			},
		},
	}

	queryJSON, err := json.Marshal(query)
	if err != nil {
		return nil, err
	}

	req := esapi.SearchRequest{
		Index: []string{"catalog"},
		Body:  strings.NewReader(string(queryJSON)),
	}

	res, err := req.Do(ctx, r.client)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("error searching documents: %s", res.String())
	}

	var result map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}

	products := []Product{}
	hits := result["hits"].(map[string]interface{})["hits"].([]interface{})
	for _, hit := range hits {
		source := hit.(map[string]interface{})["_source"]
		sourceJSON, err := json.Marshal(source)
		if err != nil {
			return nil, err
		}

		var p productDocument
		if err := json.Unmarshal(sourceJSON, &p); err != nil {
			return nil, err
		}

		products = append(products, Product{
			ID:           hit.(map[string]interface{})["_id"].(string),
			Name:         p.Name,
			Description:  p.Description,
			Price:        p.Price,
			Category:     p.Category,
			ImageURL:     p.ImageURL,
			Tags:         p.Tags,
			Availability: p.Availability,
			Stock:        p.Stock,
		})
	}

	return products, nil
}

func (r *elasticRepository) SearchProducts(ctx context.Context, query string, skip, take uint64, category string, sort *pb.ProductSortInput) ([]Product, error) {
	searchQuery := map[string]interface{}{
		"from": skip,
		"size": take,
		"query": map[string]interface{}{
			"bool": map[string]interface{}{
				"must": []map[string]interface{}{
					{
						"multi_match": map[string]interface{}{
							"query":  query,
							"fields": []string{"name", "description"},
						},
					},
				},
			},
		},
	}

	if category != "" {
		if _, ok := searchQuery["query"].(map[string]interface{})["bool"].(map[string]interface{})["filter"]; !ok {
			searchQuery["query"].(map[string]interface{})["bool"].(map[string]interface{})["filter"] = map[string]interface{}{
				"term": map[string]interface{}{
					"category": category,
				},
			}
		} else {
			// If a filter already exists, add a "must" clause with the new filter
			mustFilters := searchQuery["query"].(map[string]interface{})["bool"].(map[string]interface{})["filter"]
			searchQuery["query"].(map[string]interface{})["bool"].(map[string]interface{})["filter"] = map[string]interface{}{
				"bool": map[string]interface{}{
					"must": []interface{}{
						mustFilters,
						map[string]interface{}{
							"term": map[string]interface{}{
								"category": category,
							},
						},
					},
				},
			}
		}
	}

	if sort != nil {
		sortField := ""
		switch sort.Field {
		case pb.ProductSortField_NAME:
			sortField = "name.keyword"
		case pb.ProductSortField_PRICE:
			sortField = "price"
		default:
			sortField = "_id" // Default sorting
		}

		sortDirection := "asc"
		if sort.Direction == pb.SortDirection_DESC {
			sortDirection = "desc"
		}

		searchQuery["sort"] = []map[string]interface{}{
			{
				sortField: map[string]interface{}{
					"order": sortDirection,
				},
			},
		}
	}

	queryJSON, err := json.Marshal(searchQuery)
	if err != nil {
		return nil, err
	}

	req := esapi.SearchRequest{
		Index: []string{"catalog"},
		Body:  strings.NewReader(string(queryJSON)),
	}

	res, err := req.Do(ctx, r.client)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("error searching documents: %s", res.String())
	}

	var result map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, err
	}

	products := []Product{}
	hits := result["hits"].(map[string]interface{})["hits"].([]interface{})
	for _, hit := range hits {
		source := hit.(map[string]interface{})["_source"]
		sourceJSON, err := json.Marshal(source)
		if err != nil {
			return nil, err
		}

		var p productDocument
		if err := json.Unmarshal(sourceJSON, &p); err != nil {
			return nil, err
		}

		products = append(products, Product{
			ID:           hit.(map[string]interface{})["_id"].(string),
			Name:         p.Name,
			Description:  p.Description,
			Price:        p.Price,
			Category:     p.Category,
			ImageURL:     p.ImageURL,
			Tags:         p.Tags,
			Availability: p.Availability,
			Stock:        p.Stock,
		})
	}

	return products, nil
}

func (r *elasticRepository) DeductStock(ctx context.Context, id string, quantity int64) error {
	// Step 1: Get the existing product by ID
	product, err := r.GetProductByID(ctx, id)
	if err != nil {
		if err == ErrNotFound {
			return fmt.Errorf("product with ID %s not found", id)
		}
		return fmt.Errorf("error retrieving product: %v", err)
	}

	// Step 2: Check if the requested quantity exceeds the available stock
	if quantity > product.Stock {
		return fmt.Errorf("no stock. required quantity %d exceeds available stock %d. try again later", quantity, product.Stock)
	}

	// Step 3: Calculate the new stock and update availability
	newStock := product.Stock - quantity
	availability := true
	if newStock == 0 {
		availability = false
	}

	// Step 4: Prepare the update payload
	updatePayload := map[string]interface{}{
		"doc": map[string]interface{}{
			"stock":        newStock,
			"availability": availability,
		},
	}

	// Step 5: Marshal the update payload to JSON
	updatePayloadJSON, err := json.Marshal(updatePayload)
	if err != nil {
		return fmt.Errorf("error marshaling update payload: %v", err)
	}

	// Step 6: Perform a partial update using UpdateRequest
	updateReq := esapi.UpdateRequest{
		Index:      "catalog",
		DocumentID: id,
		Body:       strings.NewReader(string(updatePayloadJSON)),
		Refresh:    "true", // Ensure the change is immediately visible
	}

	res, err := updateReq.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("error executing update request: %v", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("error updating product: status=%s, response=%s", res.Status(), res.String())
	}

	return nil
}
