package account

import (
	"context"
	"fmt"

	"github.com/segmentio/ksuid"
	"golang.org/x/crypto/bcrypt"
)

type Service interface {
	PostAccount(ctx context.Context, first_name string, last_name string, email string, password string) (*Account, error)
	Login(ctx context.Context, email string, password string) (*Account, string, string, error)
	GetAccount(ctx context.Context, id string, accessToken string, refreshToken string) (*Account, string, string, error)
	GetAccounts(ctx context.Context, skip uint64, take uint64, accessToken string, refreshToken string) ([]Account, string, string, error)
	SetAccountAsAdmin(ctx context.Context, accessToken string, refreshToken string, id string) (*Account, string, string, error)
	ForgotPassword(ctx context.Context, email string, firstName string, lastName string) (*Account, error)
	ResetPassword(ctx context.Context, id string, email string, password string) (*Account, error)
	RefreshToken(ctx context.Context, refreshToken string) (string, error)
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
	accessToken, err := GenerateAccessToken(account.Email, account.Role)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := GenerateRefreshToken(account.Email, account.Role)
	if err != nil {
		return nil, "", "", err
	}

	return account, accessToken, refreshToken, nil
}

func (s *accountService) GetAccount(ctx context.Context, id string, accessToken string, refreshToken string) (*Account, string, string, error) {
	newAccessToken, newRefreshToken, _, err := s.validateAndRegenerateToken(ctx, accessToken, refreshToken)
	if err != nil {
		return nil, "", "", err
	}
	account, err := s.repository.GetAccountByID(ctx, id)
	return account, newAccessToken, newRefreshToken, err
}

func (s *accountService) GetAccounts(ctx context.Context, skip uint64, take uint64, accessToken string, refreshToken string) ([]Account, string, string, error) {
	newAccessToken, newRefreshToken, claims, err := s.validateAndRegenerateToken(ctx, accessToken, refreshToken)
	if err != nil {
		return nil, "", "", err
	}

	if claims.Role != "admin" {
		return nil, "", "", fmt.Errorf("unauthorized")
	}

	if take > 100 || (skip == 0 && take == 0) {
		take = 100
	}

	accounts, err := s.repository.ListAccounts(ctx, skip, take)
	return accounts, newAccessToken, newRefreshToken, err
}

func (s *accountService) SetAccountAsAdmin(ctx context.Context, accessToken string, refreshToken string, id string) (*Account, string, string, error) {
	newAccessToken, newRefreshToken, claims, err := s.validateAndRegenerateToken(ctx, accessToken, refreshToken)
	if err != nil {
		return nil, "", "", err
	}

	if claims.Role != "admin" {
		return nil, "", "", fmt.Errorf("unauthorized")
	}

	account, err := s.repository.UpdateAccountRole(ctx, id, "admin")
	return account, newAccessToken, newRefreshToken, err
}

func (s *accountService) ForgotPassword(ctx context.Context, email string, firstName string, lastName string) (*Account, error) {
	account, err := s.repository.GetAccountByEmailAndName(ctx, firstName, lastName, email)
	if err != nil {
		return nil, fmt.Errorf("account not found")
	}
	// In a real scenario, you wouldn't directly return the account here.
	return account, nil
}

func (s *accountService) ResetPassword(ctx context.Context, id string, email string, password string) (*Account, error) {
	account, err := s.repository.GetAccountById(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("account not found")
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	account.PasswordHash = string(passwordHash)
	account, err = s.repository.UpdatePasswordHash(ctx, email, string(passwordHash))
	if err != nil {
		return nil, err
	}

	return account, nil
}

func (s *accountService) RefreshToken(ctx context.Context, oldRefreshToken string) (string, error) {
	claims, err := ValidateToken(oldRefreshToken)
	if err != nil {
		return "", fmt.Errorf("invalid refresh token: %w", err)
	}

	newAccessToken, err := GenerateAccessToken(claims.Username, claims.Role)
	if err != nil {
		return "", fmt.Errorf("failed to generate new access token: %w", err)
	}

	return newAccessToken, nil
}
