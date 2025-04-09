package catalog

import (
	"context"

	"github.com/JonathanNithi/ecommerce/backend/catalog/pb"
	"google.golang.org/grpc"
)

type Client struct {
	conn    *grpc.ClientConn
	service pb.CatalogServiceClient
}

func NewClient(url string) (*Client, error) {
	conn, err := grpc.Dial(url, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	c := pb.NewCatalogServiceClient(conn)
	return &Client{conn, c}, nil
}

func (c *Client) Close() {
	c.conn.Close()
}

func (c *Client) PostProduct(ctx context.Context, name, description string, price float64, category string, imageUrl string, tags []string, stock int64) (*Product, error) {
	// Make the request to the service
	r, err := c.service.PostProduct(
		ctx,
		&pb.PostProductRequest{
			Name:        name,
			Description: description,
			Price:       price,
			Category:    category,
			ImageUrl:    imageUrl,
			Tags:        tags,
			Stock:       stock,
		},
	)
	if err != nil {
		return nil, err
	}

	// Return the updated product response
	return &Product{
		ID:           r.Product.Id,
		Name:         r.Product.Name,
		Description:  r.Product.Description,
		Price:        r.Product.Price,
		Category:     r.Product.Category,
		ImageURL:     r.Product.ImageUrl,
		Tags:         r.Product.Tags,
		Availability: r.Product.Availability,
		Stock:        r.Product.Stock,
	}, nil
}

func (c *Client) GetProduct(ctx context.Context, id string) (*Product, error) {
	r, err := c.service.GetProduct(
		ctx,
		&pb.GetProductRequest{
			Id: id,
		},
	)
	if err != nil {
		return nil, err
	}

	return &Product{
		ID:           r.Product.Id,
		Name:         r.Product.Name,
		Description:  r.Product.Description,
		Price:        r.Product.Price,
		Category:     r.Product.Category,
		ImageURL:     r.Product.ImageUrl,
		Tags:         r.Product.Tags,
		Availability: r.Product.Availability,
		Stock:        r.Product.Stock,
	}, nil
}

func (c *Client) GetProducts(ctx context.Context, skip uint64, take uint64, ids []string, query string, category string, sortBy *pb.ProductSortInput) ([]Product, uint64, error) {
	r, err := c.service.GetProducts(
		ctx,
		&pb.GetProductsRequest{
			Ids:      ids,
			Skip:     skip,
			Take:     take,
			Query:    query,
			Category: category,
			Sort:     sortBy,
		},
	)
	if err != nil {
		return nil, 0, err // Return 0 for total count on error
	}
	products := []Product{}
	for _, p := range r.Products {
		products = append(products, Product{
			ID:           p.Id,
			Name:         p.Name,
			Description:  p.Description,
			Price:        p.Price,
			Category:     p.Category,
			ImageURL:     p.ImageUrl,
			Tags:         p.Tags,
			Availability: p.Availability,
			Stock:        p.Stock,
		})
	}
	return products, r.TotalCount, nil // Return the total count from the response
}

// create a method DeductStock to deduct stock from the product
func (c *Client) DeductStock(ctx context.Context, id string, quantity int64) error {
	// Ensure DeductStock method is defined in the pb package
	_, err := c.service.DeductStock(
		ctx,
		&pb.DeductStockRequest{
			Id:       id,
			Quantity: quantity,
		},
	)
	return err
}
