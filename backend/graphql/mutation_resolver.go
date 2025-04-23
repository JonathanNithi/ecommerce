package main

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/JonathanNithi/ecommerce/backend/order"
)

var (
	ErrInvalidParameter = errors.New("invalid parameter")
)

type mutationResolver struct {
	server *Server
}

func (r *mutationResolver) CreateAccount(ctx context.Context, in AccountInput) (*Account, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()
	//password without hashing will be sent to service where it will be hashed
	a, err := r.server.accountClient.PostAccount(ctx, in.FirstName, in.LastName, in.Email, in.Password)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return &Account{
		ID:           a.ID,
		FirstName:    a.FirstName,
		LastName:     a.LastName,
		Email:        a.Email,
		PasswordHash: a.PasswordHash,
	}, nil
}

func (r *mutationResolver) CreateProduct(ctx context.Context, in ProductInput) (*Product, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	p, err := r.server.catalogClient.PostProduct(ctx, in.Name, in.Description, in.Price, in.Category, in.ImageURL, in.Tags, int64(in.Stock))
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return &Product{
		ID:           p.ID,
		Name:         p.Name,
		Description:  p.Description,
		Price:        p.Price,
		Category:     p.Category,
		ImageURL:     p.ImageURL,
		Tags:         p.Tags,
		Availability: p.Availability,
		Stock:        int(p.Stock),
	}, nil
}

func (r *mutationResolver) CreateOrder(ctx context.Context, in OrderInput) (*Order, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	var products []order.OrderedProduct
	for _, p := range in.Products {
		if p.Quantity <= 0 {
			return nil, ErrInvalidParameter
		}
		products = append(products, order.OrderedProduct{
			ID:       p.ProductID,
			Quantity: uint32(p.Quantity),
		})
	}
	o, err := r.server.orderClient.PostOrder(ctx, in.AccountID, in.AccessToken, in.RefreshToken, products)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return &Order{
		ID:         o.ID,
		CreatedAt:  o.CreatedAt,
		TotalPrice: o.TotalPrice,
	}, nil
}

func (r *mutationResolver) Login(ctx context.Context, email string, password string) (*LoginResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	// Capture all return values from accountClient.Login
	account, accessToken, refreshToken, err := r.server.accountClient.Login(ctx, email, password)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	// Return the Account along with AccessToken and RefreshToken
	return &LoginResponse{
		Account: &Account{
			ID:           account.ID,
			FirstName:    account.FirstName,
			LastName:     account.LastName,
			Email:        account.Email,
			PasswordHash: account.PasswordHash,
			Role:         Role(account.Role),
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (r *mutationResolver) SetAccountAsAdmin(ctx context.Context, accessToken string, refreshToken string, userId string) (*Account, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	// Capture all return values from accountClient.SetAccountAsAdmin
	a, newAccessToken, newRefreshToken, err := r.server.accountClient.SetAccountAsAdmin(ctx, accessToken, refreshToken, userId)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	_ = newAccessToken
	_ = newRefreshToken

	return &Account{
		ID:           a.ID,
		FirstName:    a.FirstName,
		LastName:     a.LastName,
		Email:        a.Email,
		PasswordHash: a.PasswordHash,
		Role:         Role(a.Role),
	}, nil
}

func (r *mutationResolver) UpdateStock(ctx context.Context, input UpdateProductStockInput) (*UpdateProductStockResponse, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	// 1. Authenticate and Authorize the user based on the provided tokens
	accountResp, _, _, err := r.server.accountClient.GetAccount(ctx, input.AccountID, input.AccessToken, input.RefreshToken)
	if err != nil {
		log.Println("Authentication failed:", err)
		return nil, err
	}

	// 2. Check if the user has the 'admin' role
	if accountResp.Role != "admin" {
		log.Println("Unauthorized access attempt to update product stock.")
		return nil, err
	}

	// 3. Call the Catalog service to update the stock
	updateResp, err := r.server.catalogClient.UpdateStock(ctx, input.ProductID, int64(input.NewStock))
	if err != nil {
		log.Println("Error updating product stock via gRPC:", err)
		return nil, err
	}

	// 4. Return the updated product in the UpdateProductStockResponse
	return &UpdateProductStockResponse{
		Product: &Product{
			ID:           updateResp.ID,
			Name:         updateResp.Name,
			Description:  updateResp.Description,
			Price:        float64(updateResp.Price),
			Category:     updateResp.Category,
			ImageURL:     updateResp.ImageURL,
			Tags:         updateResp.Tags,
			Availability: updateResp.Availability,
			Stock:        int(updateResp.Stock),
		},
	}, nil
}

func (r *mutationResolver) ForgotPassword(ctx context.Context, in ForgotPasswordInput) (*Account, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	account, err := r.server.accountClient.ForgotPassword(ctx, in.Email, in.FirstName, in.LastName)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return &Account{
		ID:           account.ID,
		FirstName:    account.FirstName,
		LastName:     account.LastName,
		Email:        account.Email,
		PasswordHash: account.PasswordHash,
		Role:         Role(account.Role),
	}, nil
}

func (r *mutationResolver) ResetPassword(ctx context.Context, in ResetPasswordInput) (*Account, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	account, err := r.server.accountClient.ResetPassword(ctx, in.ID, in.Email, in.Password)
	if err != nil {
		log.Println(err)
		return nil, err
	}

	return &Account{
		ID:           account.ID,
		FirstName:    account.FirstName,
		LastName:     account.LastName,
		Email:        account.Email,
		PasswordHash: account.PasswordHash,
		Role:         Role(account.Role),
	}, nil
}

func (r *mutationResolver) RefreshToken(ctx context.Context, input RefreshTokenInput) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	accessToken, err := r.server.accountClient.RefreshToken(ctx, input.RefreshToken)
	if err != nil {
		log.Println(err)
		return "", err
	}

	return accessToken, nil
}
