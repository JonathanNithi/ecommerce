package order

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockRepository for testing
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) PutOrder(ctx context.Context, order Order) error {
	args := m.Called(ctx, order)
	return args.Error(0)
}

func (m *MockRepository) GetOrdersForAccount(ctx context.Context, accountID string) ([]Order, error) {
	args := m.Called(ctx, accountID)
	orders, ok := args.Get(0).([]Order)
	if !ok {
		return nil, args.Error(1)
	}
	return orders, args.Error(1)
}

func (m *MockRepository) Close() {
}

func TestOrderService_PostOrder_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testAccountID"
	products := []OrderedProduct{
		{ID: "prod1", Name: "Product 1", Price: 10.0, Quantity: 2, ImageUrl: "url1"},
		{ID: "prod2", Name: "Product 2", Price: 5.0, Quantity: 1, ImageUrl: "url2"},
	}
	expectedTotalPrice := 25.0

	mockRepo.On("PutOrder", ctx, mock.AnythingOfType("order.Order")).Return(nil).Once()

	order, err := service.PostOrder(ctx, accountID, products)

	assert.NoError(t, err)
	assert.NotNil(t, order)
	assert.NotEmpty(t, order.ID)
	assert.WithinDuration(t, time.Now().UTC(), order.CreatedAt, time.Second)
	assert.Equal(t, accountID, order.AccountID)
	assert.Equal(t, products, order.Products)
	assert.Equal(t, expectedTotalPrice, order.TotalPrice)
	mockRepo.AssertExpectations(t)
}

func TestOrderService_PostOrder_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testAccountID"
	products := []OrderedProduct{
		{ID: "prod1", Name: "Product 1", Price: 10.0, Quantity: 2, ImageUrl: "url1"},
	}
	expectedError := errors.New("repository error")

	mockRepo.On("PutOrder", ctx, mock.AnythingOfType("order.Order")).Return(expectedError).Once()

	order, err := service.PostOrder(ctx, accountID, products)

	assert.Error(t, err)
	assertNil(t, order)
	assert.EqualError(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestOrderService_PostOrder_NoProducts(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testAccountID"
	products := []OrderedProduct{}
	expectedTotalPrice := 0.0

	mockRepo.On("PutOrder", ctx, mock.AnythingOfType("order.Order")).Return(nil).Once()

	order, err := service.PostOrder(ctx, accountID, products)

	assert.NoError(t, err)
	assert.NotNil(t, order)
	assert.Equal(t, expectedTotalPrice, order.TotalPrice)
	assert.Empty(t, order.Products)
	mockRepo.AssertExpectations(t)
}

func TestOrderService_GetOrdersForAccount_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testAccountID"
	expectedOrders := []Order{
		{ID: "order1", AccountID: accountID, TotalPrice: 15.0, CreatedAt: time.Now().UTC(), Products: []OrderedProduct{}},
		{ID: "order2", AccountID: accountID, TotalPrice: 30.0, CreatedAt: time.Now().UTC(), Products: []OrderedProduct{}},
	}

	mockRepo.On("GetOrdersForAccount", ctx, accountID).Return(expectedOrders, nil).Once()

	orders, err := service.GetOrdersForAccount(ctx, accountID)

	assert.NoError(t, err)
	assert.Equal(t, expectedOrders, orders)
	mockRepo.AssertExpectations(t)
}

func TestOrderService_GetOrdersForAccount_NotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "nonExistentAccountID"
	expectedError := errors.New("no orders found for this account")

	mockRepo.On("GetOrdersForAccount", ctx, accountID).Return(nil, expectedError).Once()

	orders, err := service.GetOrdersForAccount(ctx, accountID)

	assert.Error(t, err)
	assertNil(t, orders)
	assert.EqualError(t, err, "no orders found for this account")
	mockRepo.AssertExpectations(t)
}

func TestOrderService_GetOrdersForAccount_EmptyOrders(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	accountID := "testAccountID"
	expectedOrders := []Order{}

	mockRepo.On("GetOrdersForAccount", ctx, accountID).Return(expectedOrders, nil).Once()

	orders, err := service.GetOrdersForAccount(ctx, accountID)

	assert.NoError(t, err)
	assertEmpty(t, orders)
	mockRepo.AssertExpectations(t)
}

// Helper functions
func assertNil(t *testing.T, actual interface{}) {
	assert.Nil(t, actual)
}

func assertEmpty(t *testing.T, actual interface{}) {
	assert.Empty(t, actual)
}
