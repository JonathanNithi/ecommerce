package account

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

// MockRepository for testing
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) PutAccount(ctx context.Context, account Account) error {
	args := m.Called(ctx, account)
	return args.Error(0)
}

func (m *MockRepository) GetAccountByID(ctx context.Context, id string) (*Account, error) {
	args := m.Called(ctx, id)
	account, ok := args.Get(0).(*Account) // Use Get instead of Index
	if !ok {
		return nil, args.Error(1)
	}
	return account, args.Error(1)
}

func (m *MockRepository) GetAccountByEmail(ctx context.Context, email string) (*Account, error) {
	args := m.Called(ctx, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*Account), args.Error(1)
}

func (m *MockRepository) ListAccounts(ctx context.Context, skip uint64, take uint64) ([]Account, error) {
	args := m.Called(ctx, skip, take)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]Account), args.Error(1)
}

func (m *MockRepository) UpdateAccountRole(ctx context.Context, id string, role string) (*Account, error) {
	args := m.Called(ctx, id, role)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*Account), args.Error(1)
}

func (m *MockRepository) GetAccountByEmailAndName(ctx context.Context, firstName string, lastName string, email string) (*Account, error) {
	args := m.Called(ctx, firstName, lastName, email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*Account), args.Error(1)
}

func (m *MockRepository) GetAccountById(ctx context.Context, id string) (*Account, error) {
	args := m.Called(ctx, id)
	account, ok := args.Get(0).(*Account) // Use Get instead of Index
	if !ok {
		return nil, args.Error(1)
	}
	return account, args.Error(1)
}

func (m *MockRepository) UpdatePasswordHash(ctx context.Context, email string, passwordHash string) (*Account, error) {
	args := m.Called(ctx, email, passwordHash)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*Account), args.Error(1)
}

func (m *MockRepository) Close() {
}

func TestAccountService_PostAccount_Success_NoHash(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	firstName := "John"
	lastName := "Doe"
	email := "john.doe@example.com"
	password := "securePassword123"

	// Expect PutAccount to be called with the unhashed password
	mockRepo.On("PutAccount", ctx, mock.AnythingOfType("account.Account")).Return(nil)

	account, err := service.PostAccount(ctx, firstName, lastName, email, password)

	assert.NoError(t, err)
	assert.NotNil(t, account)
	assert.Equal(t, firstName, account.FirstName)
	assert.Equal(t, lastName, account.LastName)
	assert.Equal(t, email, account.Email)
	assert.NotEmpty(t, account.PasswordHash)
	assert.Equal(t, "user", account.Role)
	assert.NotEmpty(t, account.ID)
	mockRepo.AssertExpectations(t)
}

func TestAccountService_PostAccount_HashingError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	firstName := "Jane"
	lastName := "Smith"
	email := "jane.smith@example.com"
	password := "" // Will cause bcrypt error

	account, err := service.PostAccount(ctx, firstName, lastName, email, password)

	assert.Error(t, err)
	assert.Nil(t, account)
	mockRepo.AssertNotCalled(t, "PutAccount", mock.Anything, mock.Anything)
}

func TestAccountService_PostAccount_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	firstName := "Peter"
	lastName := "Jones"
	email := "peter.jones@example.com"
	password := "anotherSecurePassword"

	mockRepo.On("PutAccount", ctx, mock.AnythingOfType("Account")).Return(errors.New("repository error")).Once()

	account, err := service.PostAccount(ctx, firstName, lastName, email, password)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.ErrorContains(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_Login_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	email := "test@example.com"
	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	mockAccount := &Account{ID: "someID", Email: email, PasswordHash: string(hashedPassword), Role: "user"}

	mockRepo.On("GetAccountByEmail", ctx, email).Return(mockAccount, nil).Once()

	account, accessToken, refreshToken, err := service.Login(ctx, email, password)

	assert.NoError(t, err)
	assert.NotNil(t, account)
	assert.NotEmpty(t, accessToken)
	assert.NotEmpty(t, refreshToken)
	assert.Equal(t, mockAccount.ID, account.ID)
	mockRepo.AssertExpectations(t)
}

func TestAccountService_Login_AccountNotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	email := "test@example.com"
	password := "password123"

	mockRepo.On("GetAccountByEmail", ctx, email).Return(nil, errors.New("account not found")).Once()

	account, accessToken, refreshToken, err := service.Login(ctx, email, password)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.Empty(t, accessToken)
	assert.Empty(t, refreshToken)
	assert.ErrorContains(t, err, "account not found")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_Login_InvalidPassword(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	email := "test@example.com"
	password := "wrongpassword"
	correctPassword := "correctpassword"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(correctPassword), bcrypt.DefaultCost)
	mockAccount := &Account{ID: "someID", Email: email, PasswordHash: string(hashedPassword), Role: "user"}

	mockRepo.On("GetAccountByEmail", ctx, email).Return(mockAccount, nil).Once()

	account, accessToken, refreshToken, err := service.Login(ctx, email, password)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.Empty(t, accessToken)
	assert.Empty(t, refreshToken)
	assert.ErrorContains(t, err, "invalid email or password")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_GetAccount_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	// Test data
	accountID := "testID"
	accessToken := "validAccessToken"
	refreshToken := "validRefreshToken"
	mockAccount := &Account{ID: accountID, Email: "test@example.com"}

	// Mock the repository call to return the mock account
	mockRepo.On("GetAccountByID", ctx, accountID).Return(mockAccount, nil).Once()

	// Mock the validateToken method to return the provided tokens and claims.  Crucially, return nil for the error.
	// Call the service method under test
	account, _, _, err := service.GetAccount(ctx, accountID, accessToken, refreshToken)

	// Assertions
	assert.NoError(t, err)
	assert.NotNil(t, account)
	assert.Equal(t, mockAccount.ID, account.ID)
	// assert.Equal(t, accessToken, newAccessToken)
	// assert.Equal(t, refreshToken, newRefreshToken)
	mockRepo.AssertExpectations(t)
}

func TestAccountService_GetAccount_InvalidToken(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	accessToken := "invalidAccessToken"
	refreshToken := "validRefreshToken"

	account, newAccessToken, newRefreshToken, err := service.GetAccount(ctx, accountID, accessToken, refreshToken)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.Empty(t, newAccessToken)
	assert.Empty(t, newRefreshToken)
	mockRepo.AssertNotCalled(t, "GetAccountByID", mock.Anything, mock.Anything)
}

func TestAccountService_GetAccount_AccountNotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	accessToken := "validAccessToken"
	refreshToken := "validRefreshToken"

	mockRepo.On("GetAccountByID", ctx, accountID).Return(nil, errors.New("account not found")).Once()

	account, newAccessToken, newRefreshToken, err := service.GetAccount(ctx, accountID, accessToken, refreshToken)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.NotEmpty(t, newAccessToken)
	assert.NotEmpty(t, newRefreshToken)
	assert.ErrorContains(t, err, "account not found")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_GetAccounts_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	skip := uint64(0)
	take := uint64(10)
	accessToken := generateValidAdminToken()
	refreshToken := generateValidAdminToken()
	mockAccounts := []Account{{ID: "1"}, {ID: "2"}}

	mockRepo.On("ListAccounts", ctx, skip, take).Return(mockAccounts, nil).Once()

	accounts, newAccessToken, newRefreshToken, err := service.GetAccounts(ctx, skip, take, accessToken, refreshToken)

	assert.NoError(t, err)
	assert.NotNil(t, accounts)
	assert.Len(t, accounts, 2)
	assert.NotEmpty(t, newAccessToken)
	assert.NotEmpty(t, newRefreshToken)
	mockRepo.AssertExpectations(t)
}

func TestAccountService_GetAccounts_Unauthorized(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	skip := uint64(0)
	take := uint64(10)
	accessToken := generateValidUserToken()
	refreshToken := generateValidUserToken()

	accounts, newAccessToken, newRefreshToken, err := service.GetAccounts(ctx, skip, take, accessToken, refreshToken)

	assert.Error(t, err)
	assert.Nil(t, accounts)
	assert.Empty(t, newAccessToken)
	assert.Empty(t, newRefreshToken)
	assert.ErrorContains(t, err, "unauthorized")
	mockRepo.AssertNotCalled(t, "ListAccounts", mock.Anything, mock.Anything)
}

func TestAccountService_GetAccounts_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	skip := uint64(0)
	take := uint64(10)
	accessToken := generateValidAdminToken()
	refreshToken := generateValidAdminToken()

	mockRepo.On("ListAccounts", ctx, skip, take).Return(nil, errors.New("repository error")).Once()

	accounts, newAccessToken, newRefreshToken, err := service.GetAccounts(ctx, skip, take, accessToken, refreshToken)

	assert.Error(t, err)
	assert.Nil(t, accounts)
	assert.NotEmpty(t, newAccessToken)
	assert.NotEmpty(t, newRefreshToken)
	assert.ErrorContains(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_SetAccountAsAdmin_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	accessToken := generateValidAdminToken()
	refreshToken := generateValidAdminToken()
	updatedAccount := &Account{ID: accountID, Role: "admin"}

	mockRepo.On("UpdateAccountRole", ctx, accountID, "admin").Return(updatedAccount, nil).Once()

	account, newAccessToken, newRefreshToken, err := service.SetAccountAsAdmin(ctx, accessToken, refreshToken, accountID)

	assert.NoError(t, err)
	assert.NotNil(t, account)
	assert.Equal(t, "admin", account.Role)
	assert.NotEmpty(t, newAccessToken)
	assert.NotEmpty(t, newRefreshToken)
	mockRepo.AssertExpectations(t)
}

func TestAccountService_SetAccountAsAdmin_Unauthorized(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	accessToken := generateValidUserToken()
	refreshToken := generateValidUserToken()

	account, newAccessToken, newRefreshToken, err := service.SetAccountAsAdmin(ctx, accessToken, refreshToken, accountID)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.Empty(t, newAccessToken)
	assert.Empty(t, newRefreshToken)
	assert.ErrorContains(t, err, "unauthorized")
	mockRepo.AssertNotCalled(t, "UpdateAccountRole", mock.Anything, mock.Anything, mock.Anything)
}

func TestAccountService_SetAccountAsAdmin_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	accessToken := generateValidAdminToken()
	refreshToken := generateValidAdminToken()

	mockRepo.On("UpdateAccountRole", ctx, accountID, "admin").Return(nil, errors.New("repository error")).Once()

	account, newAccessToken, newRefreshToken, err := service.SetAccountAsAdmin(ctx, accessToken, refreshToken, accountID)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.NotEmpty(t, newAccessToken)
	assert.NotEmpty(t, newRefreshToken)
	assert.ErrorContains(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_ForgotPassword_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	email := "test@example.com"
	firstName := "Test"
	lastName := "User"
	mockAccount := &Account{ID: "someID", Email: email, FirstName: firstName, LastName: lastName}

	mockRepo.On("GetAccountByEmailAndName", ctx, firstName, lastName, email).Return(mockAccount, nil).Once()

	account, err := service.ForgotPassword(ctx, email, firstName, lastName)

	assert.NoError(t, err)
	assert.NotNil(t, account)
	assert.Equal(t, mockAccount.ID, account.ID)
	mockRepo.AssertExpectations(t)
}

func TestAccountService_ForgotPassword_AccountNotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	email := "test@example.com"
	firstName := "Test"
	lastName := "User"

	mockRepo.On("GetAccountByEmailAndName", ctx, firstName, lastName, email).Return(nil, errors.New("account not found")).Once()

	account, err := service.ForgotPassword(ctx, email, firstName, lastName)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.ErrorContains(t, err, "account not found")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_ResetPassword_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	email := "test@example.com"
	newPassword := "newSecurePassword"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	mockAccount := &Account{ID: accountID, Email: email}
	updatedAccount := &Account{ID: accountID, Email: email, PasswordHash: string(hashedPassword)}

	mockRepo.On("GetAccountById", ctx, accountID).Return(mockAccount, nil).Once()
	mockRepo.On("UpdatePasswordHash", ctx, email, string(hashedPassword)).Return(updatedAccount, nil).Once()

	account, err := service.ResetPassword(ctx, accountID, email, newPassword)

	assert.NoError(t, err)
	assert.NotNil(t, account)
	assert.Equal(t, accountID, account.ID)
	assert.Equal(t, email, account.Email)
	assert.NotEmpty(t, account.PasswordHash)
	mockRepo.AssertExpectations(t)
}

func TestAccountService_ResetPassword_AccountNotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	email := "test@example.com"
	newPassword := "newSecurePassword"

	mockRepo.On("GetAccountById", ctx, accountID).Return(nil, errors.New("account not found")).Once()

	account, err := service.ResetPassword(ctx, accountID, email, newPassword)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.ErrorContains(t, err, "account not found")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_ResetPassword_HashingError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	email := "test@example.com"
	newPassword := "" // Will cause bcrypt error
	mockAccount := &Account{ID: accountID, Email: email}

	mockRepo.On("GetAccountById", ctx, accountID).Return(mockAccount, nil).Once()

	account, err := service.ResetPassword(ctx, accountID, email, newPassword)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.ErrorContains(t, err, "crypto/bcrypt: empty password")
	mockRepo.AssertNotCalled(t, "UpdatePasswordHash", mock.Anything, mock.Anything)
}

func TestAccountService_ResetPassword_UpdateError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testID"
	email := "test@example.com"
	newPassword := "newSecurePassword"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	mockAccount := &Account{ID: accountID, Email: email}

	mockRepo.On("GetAccountById", ctx, accountID).Return(mockAccount, nil).Once()
	mockRepo.On("UpdatePasswordHash", ctx, email, string(hashedPassword)).Return(nil, errors.New("update failed")).Once()

	account, err := service.ResetPassword(ctx, accountID, email, newPassword)

	assert.Error(t, err)
	assert.Nil(t, account)
	assert.ErrorContains(t, err, "update failed")
	mockRepo.AssertExpectations(t)
}

func TestAccountService_RefreshToken_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	username := "testuser"
	role := "user"
	refreshToken, _ := GenerateRefreshToken(username, role)

	accessToken, err := service.RefreshToken(ctx, refreshToken)

	assert.NoError(t, err)
	assert.NotEmpty(t, accessToken)

	// Verify the claims of the new access token
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(accessToken, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	assert.NoError(t, err)
	assert.True(t, token.Valid) // Ensure the token is valid

	if assert.NotNil(t, claims) {
		assert.Equal(t, username, claims.Username)
		assert.Equal(t, role, claims.Role)
		assert.True(t, claims.ExpiresAt.Time.After(time.Now())) // Ensure it's a new token with future expiration
	}
}

func TestAccountService_RefreshToken_InvalidToken(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	invalidRefreshToken := "invalid.refresh.token"

	accessToken, err := service.RefreshToken(ctx, invalidRefreshToken)

	assert.Error(t, err)
	assert.Empty(t, accessToken)
	assert.ErrorContains(t, err, "invalid refresh token")
}

// Helper function to generate a valid admin token for testing
func generateValidAdminToken() string {
	token, _ := GenerateAccessToken("adminUser", "admin")
	return token
}

// Helper function to generate a valid user token for testing
func generateValidUserToken() string {
	token, _ := GenerateAccessToken("testUser", "user")
	return token
}
