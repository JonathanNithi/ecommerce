package account

import (
	"context"
	"fmt"
	"time"

	"github.com/segmentio/ksuid"
	"golang.org/x/crypto/bcrypt"
)

type Service interface {
	PostAccount(ctx context.Context, first_name string, last_name string, email string, password string) (*Account, error)
	GetAccount(ctx context.Context, id string, accessToken string, refreshToken string) (*Account, error)
	GetAccounts(ctx context.Context, skip uint64, take uint64) ([]Account, error)
	Login(ctx context.Context, email string, password string) (*Account, string, string, error) // New method
}

type Account struct {
	ID           string `json:"id"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
	Role         string `json:"role"`
}

type accountService struct {
	repository Repository
}

func NewService(r Repository) Service {
	return &accountService{r}
}

func (s *accountService) PostAccount(ctx context.Context, first_name string, last_name string, email string, password string) (*Account, error) {
	// Hash the password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err // Return error if password hashing fails
	}

	// Create the Account object
	a := &Account{
		FirstName:    first_name,
		LastName:     last_name,
		Email:        email,
		PasswordHash: string(passwordHash), // Store the hashed password as a string
		Role:         "user",
		ID:           ksuid.New().String(),
	}

	// Save the account to the repository
	if err := s.repository.PutAccount(ctx, *a); err != nil {
		return nil, err
	}

	return a, nil
}

func (s *accountService) ValidatePassword(storedHash string, password string) bool {
	// Compare the provided password with the stored hash
	err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password))
	return err == nil
}

func (s *accountService) Login(ctx context.Context, email string, password string) (*Account, string, string, error) {
	// Fetch account by email
	account, err := s.repository.GetAccountByEmail(ctx, email)
	if err != nil {
		return nil, "", "", err // If account is not found, return an error
	}

	// Validate password
	if !s.ValidatePassword(account.PasswordHash, password) {
		return nil, "", "", fmt.Errorf("invalid email or password")
	}

	// Generate access and refresh tokens
	accessToken, err := GenerateAccessToken(account.Email)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := GenerateRefreshToken(account.Email)
	if err != nil {
		return nil, "", "", err
	}

	return account, accessToken, refreshToken, nil
}

func (s *accountService) GetAccount(ctx context.Context, id string, accessToken string, refreshToken string) (*Account, error) {
	// Validate the access token
	claims, err := ValidateToken(accessToken)
	if err != nil {
		return nil, err
	}

	// validate the refresh token
	_, err = ValidateToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// regenerate the accessToken if its expired
	if claims.ExpiresAt.Before(time.Now()) {
		accessToken, err = GenerateAccessToken(claims.Username)
		if err != nil {
			return nil, err
		}
	}

	// If the access token is valid, return the account
	return s.repository.GetAccountByID(ctx, id)
}

func (s *accountService) GetAccounts(ctx context.Context, skip uint64, take uint64) ([]Account, error) {
	if take > 100 || (skip == 0 && take == 0) {
		take = 100
	}
	return s.repository.ListAccounts(ctx, skip, take)
}
