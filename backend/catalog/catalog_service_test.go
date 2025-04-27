package catalog

import (
	"context"
	"errors"
	"testing"

	"github.com/JonathanNithi/ecommerce/backend/catalog/pb"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockRepository for testing
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) PutProduct(ctx context.Context, product Product) error {
	args := m.Called(ctx, product)
	return args.Error(0)
}

func (m *MockRepository) GetProductByID(ctx context.Context, id string) (*Product, error) {
	args := m.Called(ctx, id)
	product, ok := args.Get(0).(*Product)
	if !ok {
		return nil, args.Error(1)
	}
	return product, args.Error(1)
}

func (m *MockRepository) ListProducts(ctx context.Context, skip uint64, take uint64, sort *pb.ProductSortInput) ([]Product, uint64, error) {
	args := m.Called(ctx, skip, take, sort)
	var products []Product
	if arg := args.Get(0); arg != nil {
		var ok bool
		products, ok = arg.([]Product)
		if !ok {
			// Handle type assertion error if needed, perhaps log it
			return nil, 0, errors.New("mock: failed type assertion for products")
		}
	}
	total, _ := args.Get(1).(uint64)
	return products, total, args.Error(2)
}

func (m *MockRepository) ListProductsWithIDs(ctx context.Context, ids []string) ([]Product, error) {
	args := m.Called(ctx, ids)
	products, ok := args.Get(0).([]Product)
	if !ok {
		return nil, args.Error(1)
	}
	return products, args.Error(1)
}

func (m *MockRepository) SearchProducts(ctx context.Context, query string, skip uint64, take uint64, category string, sort *pb.ProductSortInput) ([]Product, uint64, error) {
	args := m.Called(ctx, query, skip, take, category, sort)
	var products []Product
	if arg := args.Get(0); arg != nil {
		var ok bool
		products, ok = arg.([]Product)
		if !ok {
			// Handle type assertion error if needed
			return nil, 0, errors.New("mock: failed type assertion for products in SearchProducts")
		}
	}
	total, _ := args.Get(1).(uint64)
	return products, total, args.Error(2)
}

func (m *MockRepository) DeductStock(ctx context.Context, productID string, quantity int64) error {
	args := m.Called(ctx, productID, quantity)
	return args.Error(0)
}

func (m *MockRepository) UpdateStock(ctx context.Context, productID string, newStock int64) error {
	args := m.Called(ctx, productID, newStock)
	return args.Error(0)
}

func (m *MockRepository) Close() {
}

func TestCatalogService_PostProduct_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	name := "Test Product"
	description := "This is a test product"
	price := 25.99
	category := "Electronics"
	imageUrl := "http://example.com/image.jpg"
	tags := []string{"test", "product"}
	stock := int64(10)

	mockRepo.On("PutProduct", ctx, mock.AnythingOfType("catalog.Product")).Return(nil).Once()

	product, err := service.PostProduct(ctx, name, description, price, category, imageUrl, tags, stock)

	assert.NoError(t, err)
	assert.NotNil(t, product)
	assert.NotEmpty(t, product.ID)
	assert.Equal(t, name, product.Name)
	assert.Equal(t, description, product.Description)
	assert.Equal(t, price, product.Price)
	assert.Equal(t, category, product.Category)
	assert.Equal(t, imageUrl, product.ImageURL)
	assert.Equal(t, tags, product.Tags)
	assert.True(t, product.Availability)
	assert.Equal(t, stock, product.Stock)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_PostProduct_NoStock(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	name := "Test Product"
	description := "This is a test product"
	price := 25.99
	category := "Electronics"
	imageUrl := "http://example.com/image.jpg"
	tags := []string{"test", "product"}
	stock := int64(0)

	mockRepo.On("PutProduct", ctx, mock.AnythingOfType("catalog.Product")).Return(nil).Once()

	product, err := service.PostProduct(ctx, name, description, price, category, imageUrl, tags, stock)

	assert.NoError(t, err)
	assert.NotNil(t, product)
	assert.False(t, product.Availability)
	assert.Equal(t, stock, product.Stock)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_PostProduct_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	name := "Test Product"
	description := "This is a test product"
	price := 25.99
	category := "Electronics"
	imageUrl := "http://example.com/image.jpg"
	tags := []string{"test", "product"}
	stock := int64(10)
	expectedError := errors.New("repository error")

	mockRepo.On("PutProduct", ctx, mock.AnythingOfType("catalog.Product")).Return(expectedError).Once()

	product, err := service.PostProduct(ctx, name, description, price, category, imageUrl, tags, stock)

	assert.Error(t, err)
	assert.Nil(t, product)
	assert.EqualError(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_GetProduct_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	productID := "testID"
	expectedProduct := &Product{ID: productID, Name: "Test Product"}

	mockRepo.On("GetProductByID", ctx, productID).Return(expectedProduct, nil).Once()

	product, err := service.GetProduct(ctx, productID)

	assert.NoError(t, err)
	assert.Equal(t, expectedProduct, product)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_GetProduct_NotFound(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	productID := "nonExistentID"
	expectedError := errors.New("product not found")

	mockRepo.On("GetProductByID", ctx, productID).Return(nil, expectedError).Once()

	product, err := service.GetProduct(ctx, productID)

	assert.Error(t, err)
	assert.Nil(t, product)
	assert.EqualError(t, err, "product not found")
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_GetProducts_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	skip := uint64(0)
	take := uint64(10)
	sort := &pb.ProductSortInput{}
	expectedProducts := []Product{{ID: "1", Name: "Product 1"}, {ID: "2", Name: "Product 2"}}
	expectedTotal := uint64(2)

	mockRepo.On("ListProducts", ctx, skip, take, sort).Return(expectedProducts, expectedTotal, nil).Once()

	products, total, err := service.GetProducts(ctx, skip, take, sort)

	assert.NoError(t, err)
	assert.Equal(t, expectedProducts, products)
	assert.Equal(t, expectedTotal, total)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_GetProducts_DefaultTake(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	skip := uint64(0)
	take := uint64(0)
	sort := &pb.ProductSortInput{}
	expectedProducts := []Product{{ID: "1", Name: "Product 1"}}
	expectedTotal := uint64(1)

	mockRepo.On("ListProducts", ctx, skip, uint64(100), sort).Return(expectedProducts, expectedTotal, nil).Once()

	products, total, err := service.GetProducts(ctx, skip, take, sort)

	assert.NoError(t, err)
	assert.Equal(t, expectedProducts, products)
	assert.Equal(t, expectedTotal, total)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_GetProducts_TakeOverLimit(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	skip := uint64(0)
	take := uint64(150)
	sort := &pb.ProductSortInput{}
	expectedProducts := []Product{{ID: "1", Name: "Product 1"}}
	expectedTotal := uint64(1)

	mockRepo.On("ListProducts", ctx, skip, uint64(100), sort).Return(expectedProducts, expectedTotal, nil).Once()

	products, total, err := service.GetProducts(ctx, skip, take, sort)

	assert.NoError(t, err)
	assert.Equal(t, expectedProducts, products)
	assert.Equal(t, expectedTotal, total)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_GetProducts_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	skip := uint64(0)
	take := uint64(10)
	sort := &pb.ProductSortInput{}
	expectedError := errors.New("repository error")

	mockRepo.On("ListProducts", ctx, skip, take, sort).Return(nil, uint64(0), expectedError).Once()

	products, total, err := service.GetProducts(ctx, skip, take, sort)

	assert.Error(t, err)
	assertNil(t, products)
	assertEqual(t, uint64(0), total)
	assert.EqualError(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_GetProductsById_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	ids := []string{"1", "2"}
	expectedProducts := []Product{{ID: "1", Name: "Product 1"}, {ID: "2", Name: "Product 2"}}

	mockRepo.On("ListProductsWithIDs", ctx, ids).Return(expectedProducts, nil).Once()

	products, err := service.GetProductsById(ctx, ids)

	assert.NoError(t, err)
	assert.Equal(t, expectedProducts, products)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_GetProductsById_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	ids := []string{"1", "2"}
	expectedError := errors.New("repository error")

	mockRepo.On("ListProductsWithIDs", ctx, ids).Return(nil, expectedError).Once()

	products, err := service.GetProductsById(ctx, ids)

	assert.Error(t, err)
	assertNil(t, products)
	assert.EqualError(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_SearchProducts_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	query := "test"
	skip := uint64(0)
	take := uint64(10)
	category := "All"
	sort := &pb.ProductSortInput{}
	expectedProducts := []Product{{ID: "1", Name: "Test Product 1"}, {ID: "2", Name: "Another Test"}}
	expectedTotal := uint64(2)

	mockRepo.On("SearchProducts", ctx, query, skip, take, category, sort).Return(expectedProducts, expectedTotal, nil).Once()

	products, total, err := service.SearchProducts(ctx, query, skip, take, category, sort)

	assert.NoError(t, err)
	assert.Equal(t, expectedProducts, products)
	assert.Equal(t, expectedTotal, total)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_SearchProducts_DefaultTake(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	query := "test"
	skip := uint64(0)
	take := uint64(0)
	category := "All"
	sort := &pb.ProductSortInput{}
	expectedProducts := []Product{{ID: "1", Name: "Test Product 1"}}
	expectedTotal := uint64(1)

	mockRepo.On("SearchProducts", ctx, query, skip, uint64(100), category, sort).Return(expectedProducts, expectedTotal, nil).Once()

	products, total, err := service.SearchProducts(ctx, query, skip, take, category, sort)

	assert.NoError(t, err)
	assert.Equal(t, expectedProducts, products)
	assert.Equal(t, expectedTotal, total)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_SearchProducts_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	query := "test"
	skip := uint64(0)
	take := uint64(10)
	category := "All"
	sort := &pb.ProductSortInput{}
	expectedError := errors.New("repository error")

	mockRepo.On("SearchProducts", ctx, query, skip, take, category, sort).Return(nil, uint64(0), expectedError).Once()

	products, total, err := service.SearchProducts(ctx, query, skip, take, category, sort)

	assert.Error(t, err)
	assertNil(t, products)
	assertEqual(t, uint64(0), total)
	assert.EqualError(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_DeductStock_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	productID := "testID"
	quantity := int64(5)

	mockRepo.On("DeductStock", ctx, productID, quantity).Return(nil).Once()

	err := service.DeductStock(ctx, productID, quantity)

	assert.NoError(t, err)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_DeductStock_RepositoryError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	productID := "testID"
	quantity := int64(5)
	expectedError := errors.New("repository error")

	mockRepo.On("DeductStock", ctx, productID, quantity).Return(expectedError).Once()

	err := service.DeductStock(ctx, productID, quantity)

	assert.Error(t, err)
	assert.EqualError(t, err, "repository error")
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_UpdateStock_Success(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	productID := "testID"
	newStock := int64(15)
	expectedProduct := &Product{ID: productID, Name: "Test Product", Stock: newStock, Availability: true}

	mockRepo.On("UpdateStock", ctx, productID, newStock).Return(nil).Once()
	mockRepo.On("GetProductByID", ctx, productID).Return(expectedProduct, nil).Once()

	updatedProduct, err := service.UpdateStock(ctx, productID, newStock)

	assert.NoError(t, err)
	assert.Equal(t, expectedProduct, updatedProduct)
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_UpdateStock_RepositoryUpdateError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	productID := "testID"
	newStock := int64(15)
	expectedError := errors.New("failed to update stock")

	mockRepo.On("UpdateStock", ctx, productID, newStock).Return(expectedError).Once()

	updatedProduct, err := service.UpdateStock(ctx, productID, newStock)

	assert.Error(t, err)
	assertNil(t, updatedProduct)
	assert.ErrorContains(t, err, "failed to update stock for product testID")
	mockRepo.AssertExpectations(t)
}

func TestCatalogService_UpdateStock_RepositoryGetError(t *testing.T) {
	mockRepo := new(MockRepository)
	service := NewService(mockRepo)
	ctx := context.Background()

	productID := "testID"
	newStock := int64(15)
	expectedError := errors.New("failed to retrieve product")

	mockRepo.On("UpdateStock", ctx, productID, newStock).Return(nil).Once()
	mockRepo.On("GetProductByID", ctx, productID).Return(nil, expectedError).Once()

	updatedProduct, err := service.UpdateStock(ctx, productID, newStock)

	assert.Error(t, err)
	assertNil(t, updatedProduct)
	assert.ErrorContains(t, err, "failed to retrieve updated product testID")
	mockRepo.AssertExpectations(t)
}

// Helper function to assert equality with nil check
func assertNil(t *testing.T, actual interface{}) {
	assert.Nil(t, actual)
}

// Helper function to assert equality with nil check
func assertEqual(t *testing.T, expected, actual interface{}) {
	assert.Equal(t, expected, actual)
}
