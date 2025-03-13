package catalog

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/elastic/go-elasticsearch/v8"
	"github.com/elastic/go-elasticsearch/v8/esapi"
)

var (
	ErrNotFound = errors.New("entity not found")
)

type Repository interface {
	Close()
	PutProduct(ctx context.Context, p Product) error
	GetProductByID(ctx context.Context, id string) (*Product, error)
	ListProducts(ctx context.Context, skip uint64, take uint64) ([]Product, error)
	ListProductsWithIDs(ctx context.Context, ids []string) ([]Product, error)
	SearchProducts(ctx context.Context, query string, skip uint64, take uint64) ([]Product, error)
	DeductStock(ctx context.Context, id string, newStock uint64) error
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
	Stock        uint64   `json:"stock"`
}

func NewElasticRepository(url string) (Repository, error) {
	cfg := elasticsearch.Config{
		Addresses: []string{url},
	}
	client, err := elasticsearch.NewClient(cfg)
	if err != nil {
		return nil, err
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
		Stock:        p.Stock,
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
	req := esapi.GetRequest{
		Index:      "catalog",
		DocumentID: id,
	}

	res, err := req.Do(ctx, r.client)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.IsError() {
		if res.StatusCode == 404 {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("error fetching document: %s", res.String())
	}

	var p productDocument
	if err := json.NewDecoder(res.Body).Decode(&p); err != nil {
		return nil, err
	}

	return &Product{
		ID:           id,
		Name:         p.Name,
		Description:  p.Description,
		Price:        p.Price,
		Category:     p.Category,
		ImageURL:     p.ImageURL,
		Tags:         p.Tags,
		Availability: p.Availability,
		Stock:        uint64(p.Stock),
	}, nil
}

func (r *elasticRepository) ListProducts(ctx context.Context, skip, take uint64) ([]Product, error) {
	req := esapi.SearchRequest{
		Index: []string{"catalog"},
		Body: strings.NewReader(fmt.Sprintf(`{
			"from": %d,
			"size": %d,
			"query": {
				"match_all": {}
			}
		}`, skip, take)),
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
			Stock:        uint64(p.Stock),
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
			Stock:        uint64(p.Stock),
		})
	}

	return products, nil
}

func (r *elasticRepository) SearchProducts(ctx context.Context, query string, skip, take uint64) ([]Product, error) {
	searchQuery := map[string]interface{}{
		"from": skip,
		"size": take,
		"query": map[string]interface{}{
			"multi_match": map[string]interface{}{
				"query":  query,
				"fields": []string{"name", "description"},
			},
		},
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
			Stock:        uint64(p.Stock),
		})
	}

	return products, nil
}

func (r *elasticRepository) DeductStock(ctx context.Context, id string, newStock uint64) error {
	// Step 1: Get the existing product by ID
	product, err := r.GetProductByID(ctx, id)
	if err != nil {
		if err == ErrNotFound {
			return fmt.Errorf("product with ID %s not found", id)
		}
		return fmt.Errorf("error retrieving product: %v", err)
	}

	fmt.Println(product)
	// Step 2: Update the stock field in the product document
	productDoc := productDocument{
		Stock: product.Stock - newStock, // Update the stock
	}

	// Step 3: Marshal the updated product document to JSON
	productDocJSON, err := json.Marshal(productDoc)
	if err != nil {
		return fmt.Errorf("error marshaling updated product document: %v", err)
	}

	// Step 4: Index the updated product document back into Elasticsearch
	indexReq := esapi.IndexRequest{
		Index:      "catalog",
		DocumentID: id,
		Body:       strings.NewReader(string(productDocJSON)),
		Refresh:    "true", // Ensure the change is immediately visible
	}

	res, err := indexReq.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("error executing update request: %v", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("error updating product: status=%s, response=%s", res.Status(), res.String())
	}

	return nil
}
