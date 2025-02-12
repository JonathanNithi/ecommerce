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

func (s *grpcServer) Login(ctx context.Context, r *pb.LoginRequest) (*pb.LoginResponse, error) {
	// Call the service layer login method
	account, accessToken, refreshToken, err := s.service.Login(ctx, r.Email, r.Password)
	if err != nil {
		return nil, err
	}

	// Map the account to the protobuf Account type
	return &pb.LoginResponse{
		Account: &pb.Account{
			Id:           account.ID,
			FirstName:    account.FirstName,
			LastName:     account.LastName,
			Email:        account.Email,
			PasswordHash: account.PasswordHash,
			Role:         account.Role,
		},
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *grpcServer) RefreshToken(ctx context.Context, r *pb.RefreshTokenRequest) (*pb.RefreshTokenResponse, error) {
	claims, err := ValidateToken(r.RefreshToken)
	if err != nil {
		return nil, err
	}

	// Generate a new access token
	newAccessToken, err := GenerateAccessToken(claims.Username)
	if err != nil {
		return nil, err
	}

	return &pb.RefreshTokenResponse{
		AccessToken: newAccessToken,
	}, nil
}
