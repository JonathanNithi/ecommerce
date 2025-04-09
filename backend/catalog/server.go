package catalog

import (
	"context"
	"fmt"
	"log"
	"net"

	"github.com/JonathanNithi/ecommerce/backend/catalog/pb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type grpcServer struct {
	pb.UnimplementedCatalogServiceServer
	service Service
}

func ListenGRPC(s Service, port int) error {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return err
	}
	serv := grpc.NewServer()
	pb.RegisterCatalogServiceServer(serv, &grpcServer{
		UnimplementedCatalogServiceServer: pb.UnimplementedCatalogServiceServer{},
		service:                           s})
	reflection.Register(serv)
	return serv.Serve(lis)
}

func (s *grpcServer) PostProduct(ctx context.Context, r *pb.PostProductRequest) (*pb.PostProductResponse, error) {
	p, err := s.service.PostProduct(ctx, r.Name, r.Description, r.Price, r.Category, r.ImageUrl, r.Tags, r.Stock)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return &pb.PostProductResponse{Product: &pb.Product{
		Id:           p.ID,
		Name:         p.Name,
		Description:  p.Description,
		Price:        p.Price,
		Category:     p.Category,
		ImageUrl:     p.ImageURL,
		Tags:         p.Tags,
		Availability: p.Availability,
		Stock:        p.Stock,
	}}, nil
}

func (s *grpcServer) GetProduct(ctx context.Context, r *pb.GetProductRequest) (*pb.GetProductResponse, error) {
	p, err := s.service.GetProduct(ctx, r.Id)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return &pb.GetProductResponse{
		Product: &pb.Product{
			Id:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			Price:        p.Price,
			Category:     p.Category,
			ImageUrl:     p.ImageURL,
			Tags:         p.Tags,
			Availability: p.Availability,
			Stock:        p.Stock,
		},
	}, nil
}

func (s *grpcServer) GetProducts(ctx context.Context, r *pb.GetProductsRequest) (*pb.GetProductsResponse, error) {
	var res []Product
	var err error
	var count uint64

	var sortBy *pb.ProductSortInput
	if r.Sort != nil {
		sortBy = r.Sort
	}

	if r.Query != "" || r.Category != "" {
		// Assuming your service layer has a SearchProducts that now accepts sort
		res, count, err = s.service.SearchProducts(ctx, r.Query, r.Skip, r.Take, r.Category, sortBy)
	} else if len(r.Ids) != 0 {
		// Assuming your service layer can fetch by IDs without explicit sorting
		res, err = s.service.GetProductsById(ctx, r.Ids)
		count = 1 //ID matches with only one product
	} else {
		// Assuming your service layer's GetProducts now accepts sort
		res, count, err = s.service.GetProducts(ctx, r.Skip, r.Take, sortBy)
	}

	if err != nil {
		log.Println(err)
		return nil, err
	}

	products := []*pb.Product{}
	for _, p := range res {
		products = append(
			products,
			&pb.Product{
				Id:           p.ID,
				Name:         p.Name,
				Description:  p.Description,
				Price:        p.Price,
				Category:     p.Category,
				ImageUrl:     p.ImageURL,
				Tags:         p.Tags,
				Availability: p.Availability,
				Stock:        p.Stock,
			},
		)
	}
	return &pb.GetProductsResponse{Products: products, TotalCount: count}, nil
}

func (s *grpcServer) GetProductsById(ctx context.Context, req *pb.GetProductsByIdRequest) (*pb.GetProductsByIdResponse, error) {
	productIDs := req.GetIds()
	if len(productIDs) == 0 {
		return &pb.GetProductsByIdResponse{Products: []*pb.Product{}}, nil
	}

	products, err := s.service.GetProductsById(ctx, productIDs)
	if err != nil {
		log.Printf("Error fetching products by IDs: %v", err)
		return nil, err
	}

	// Map your service/repository Product type to the gRPC pb.Product type
	pbProducts := make([]*pb.Product, len(products))
	for i, p := range products {
		pbProducts[i] = &pb.Product{
			Id:           p.ID,
			Name:         p.Name,
			Description:  p.Description,
			Price:        p.Price,
			Category:     p.Category,
			ImageUrl:     p.ImageURL,
			Tags:         p.Tags,
			Availability: p.Availability,
			Stock:        p.Stock,
		}
	}

	return &pb.GetProductsByIdResponse{Products: pbProducts}, nil
}

// create a method DeductStock to deduct stock from the product
func (s *grpcServer) DeductStock(ctx context.Context, r *pb.DeductStockRequest) (*pb.DeductStockResponse, error) {
	err := s.service.DeductStock(ctx, r.Id, r.Quantity)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	return &pb.DeductStockResponse{}, nil
}
