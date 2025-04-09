package main

import (
	"context"
	"log"
	"time"

	"github.com/JonathanNithi/ecommerce/backend/catalog/pb"
)

type queryResolver struct {
	server *Server
}

func (r *queryResolver) Accounts(ctx context.Context, pagination *PaginationInput, id *string, accessToken string, refreshToken string) ([]*Account, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	// Get single
	if id != nil {
		acc, newAccessToken, newRefreshToken, err := r.server.accountClient.GetAccount(ctx, *id, accessToken, refreshToken)
		if err != nil {
			log.Println(err)
			return nil, err
		}

		_ = newAccessToken
		_ = newRefreshToken
		return []*Account{{
			ID:        acc.ID,
			FirstName: acc.FirstName,
			LastName:  acc.LastName,
			Email:     acc.Email,
			Role:      Role(acc.Role),
		}}, nil
	}

	skip, take := uint64(0), uint64(0)
	if pagination != nil {
		skip, take = pagination.bounds()
	}
	//Get all
	accountList, newAccessToken, newRefreshToken, err := r.server.accountClient.GetAccounts(ctx, skip, take, accessToken, refreshToken)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	_ = newAccessToken
	_ = newRefreshToken

	var accounts []*Account
	for _, a := range accountList {
		account := &Account{
			ID:        a.ID,
			FirstName: a.FirstName,
			LastName:  a.LastName,
			Email:     a.Email,
			Role:      Role(a.Role),
		}
		accounts = append(accounts, account)
	}

	return accounts, nil
}

func (r *queryResolver) Products(ctx context.Context, pagination *PaginationInput, query *string, id *string, category *string, sort *ProductSortInput) (*ProductListResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	// Get single product (no total count needed here)
	if id != nil {
		prod, err := r.server.catalogClient.GetProduct(ctx, *id)
		if err != nil {
			log.Println(err)
			return nil, err
		}
		return &ProductListResponse{
			Items: []*Product{{
				ID:           prod.ID,
				Name:         prod.Name,
				Description:  prod.Description,
				Price:        prod.Price,
				Category:     prod.Category,
				ImageURL:     prod.ImageURL,
				Tags:         prod.Tags,
				Availability: prod.Availability,
				Stock:        int(prod.Stock),
			}},
			TotalCount: 1, // For a single product, the total count is 1
		}, nil
	}

	skip, take := uint64(0), uint64(0)
	if pagination != nil {
		skip, take = pagination.bounds()
	}

	q := ""
	if query != nil {
		q = *query
	}
	categoryValue := ""
	if category != nil {
		categoryValue = *category
	}

	var sortBy *pb.ProductSortInput
	if sort != nil {
		sortBy = &pb.ProductSortInput{
			Field:     pb.ProductSortField(pb.ProductSortField_value[sort.Field.String()]),
			Direction: pb.SortDirection(pb.SortDirection_value[sort.Direction.String()]),
		}
	}

	productList, totalCount, err := r.server.catalogClient.GetProducts(ctx, skip, take, nil, q, categoryValue, sortBy)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var products []*Product
	for _, a := range productList {
		products = append(products,
			&Product{
				ID:           a.ID,
				Name:         a.Name,
				Description:  a.Description,
				Price:        a.Price,
				Category:     a.Category,
				ImageURL:     a.ImageURL,
				Tags:         a.Tags,
				Availability: a.Availability,
				Stock:        int(a.Stock),
			},
		)
	}

	return &ProductListResponse{
		Items:      products,
		TotalCount: int(totalCount), // Get the total count from the gRPC response
	}, nil
}

// generate a function for productsWithIds similar to the above function
func (r *queryResolver) ProductsByID(ctx context.Context, ids []string) ([]*Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	productList, err := r.server.catalogClient.GetProductsByIDs(ctx, ids)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	var products []*Product
	for _, a := range productList {
		products = append(products,
			&Product{
				ID:           a.ID,
				Name:         a.Name,
				Description:  a.Description,
				Price:        a.Price,
				Category:     a.Category,
				ImageURL:     a.ImageURL,
				Tags:         a.Tags,
				Availability: a.Availability,
				Stock:        int(a.Stock),
			},
		)
	}

	return products, nil
}

func (p PaginationInput) bounds() (uint64, uint64) {
	skipValue := uint64(0)
	takeValue := uint64(100)
	if p.Skip != nil {
		skipValue = uint64(*p.Skip)
	}
	if p.Take != nil {
		takeValue = uint64(*p.Take)
	}
	return skipValue, takeValue
}
