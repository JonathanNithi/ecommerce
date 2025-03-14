package catalog

import (
	"context"

	"github.com/segmentio/ksuid"
)

type Service interface {
	PostProduct(ctx context.Context, name, description string, price float64, category string, imageUrl string, tags []string, stock int64) (*Product, error)
	GetProduct(ctx context.Context, id string) (*Product, error)
	GetProducts(ctx context.Context, skip uint64, take uint64) ([]Product, error)
	GetProductsByIDs(ctx context.Context, ids []string) ([]Product, error)
	SearchProducts(ctx context.Context, query string, skip uint64, take uint64) ([]Product, error)
	DeductStock(ctx context.Context, productID string, quantity int64) error
}

type Product struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Price        float64  `json:"price"`
	Category     string   `json:"category"`
	ImageURL     string   `json:"image_url"`
	Tags         []string `json:"tags"`
	Availability bool     `json:"availability"`
	Stock        int64    `json:"stock"`
}

type catalogService struct {
	repository Repository
}

func NewService(r Repository) Service {
	return &catalogService{r}
}

func (s *catalogService) PostProduct(ctx context.Context, name, description string, price float64, category string, imageUrl string, tags []string, stock int64) (*Product, error) {
	//logic to check if stock is above 0 and if so set availability to true
	var availability bool
	if stock > 0 {
		availability = true
	} else {
		availability = false
	}

	p := &Product{
		Name:         name,
		Description:  description,
		Price:        price,
		ID:           ksuid.New().String(),
		Category:     category,
		ImageURL:     imageUrl,
		Tags:         tags,
		Availability: availability,
		Stock:        stock,
	}
	if err := s.repository.PutProduct(ctx, *p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *catalogService) GetProduct(ctx context.Context, id string) (*Product, error) {
	return s.repository.GetProductByID(ctx, id)
}

func (s *catalogService) GetProducts(ctx context.Context, skip uint64, take uint64) ([]Product, error) {
	if take > 100 || (skip == 0 && take == 0) {
		take = 100
	}
	return s.repository.ListProducts(ctx, skip, take)
}

func (s *catalogService) GetProductsByIDs(ctx context.Context, ids []string) ([]Product, error) {
	return s.repository.ListProductsWithIDs(ctx, ids)
}

func (s *catalogService) SearchProducts(ctx context.Context, query string, skip uint64, take uint64) ([]Product, error) {
	if take > 100 || (skip == 0 && take == 0) {
		take = 100
	}
	return s.repository.SearchProducts(ctx, query, skip, take)
}

func (s *catalogService) DeductStock(ctx context.Context, productID string, quantity int64) error {
	return s.repository.DeductStock(ctx, productID, quantity)
}
