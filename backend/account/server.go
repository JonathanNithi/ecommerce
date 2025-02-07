package account

import (
	"context"
	"fmt"
	"net"

	"github.com/JonathanNithi/ecommerce/backend/account/pb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type grpcServer struct {
	pb.UnimplementedAccountServiceServer
	service Service
}

func ListenGRPC(s Service, port int) error {
	lis, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return err
	}
	serv := grpc.NewServer()
	pb.RegisterAccountServiceServer(serv, &grpcServer{
		UnimplementedAccountServiceServer: pb.UnimplementedAccountServiceServer{},
		service:                           s})
	reflection.Register(serv)
	return serv.Serve(lis)
}

func (s *grpcServer) PostAccount(ctx context.Context, r *pb.PostAccountRequest) (*pb.PostAccountResponse, error) {
	p, err := s.service.PostAccount(ctx, r.FirstName, r.LastName, r.Email, r.PasswordHash)
	if err != nil {
		return nil, err
	}
	return &pb.PostAccountResponse{Account: &pb.Account{
		Id:           p.ID,
		FirstName:    p.FirstName,
		LastName:     p.LastName,
		Email:        p.Email,
		PasswordHash: p.PasswordHash,
	}}, nil
}

func (s *grpcServer) GetAccount(ctx context.Context, r *pb.GetAccountRequest) (*pb.GetAccountResponse, error) {
	p, err := s.service.GetAccount(ctx, r.Id)
	if err != nil {
		return nil, err
	}
	return &pb.GetAccountResponse{
		Account: &pb.Account{
			Id:           p.ID,
			FirstName:    p.FirstName,
			LastName:     p.LastName,
			Email:        p.Email,
			PasswordHash: p.PasswordHash,
			Role:         p.Role,
		},
	}, nil
}

func (s *grpcServer) GetAccounts(ctx context.Context, r *pb.GetAccountsRequest) (*pb.GetAccountsResponse, error) {
	res, err := s.service.GetAccounts(ctx, r.Skip, r.Take)
	if err != nil {
		return nil, err
	}
	accounts := []*pb.Account{}
	for _, p := range res {
		accounts = append(
			accounts,
			&pb.Account{
				Id:           p.ID,
				FirstName:    p.FirstName,
				LastName:     p.LastName,
				Email:        p.Email,
				PasswordHash: p.PasswordHash,
				Role:         p.Role,
			},
		)
	}
	return &pb.GetAccountsResponse{Accounts: accounts}, nil
}
