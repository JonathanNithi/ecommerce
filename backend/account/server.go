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
	p, newAccessToken, newRefreshToken, err := s.service.GetAccount(ctx, r.Id, r.AccessToken, r.RefreshToken)
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
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *grpcServer) GetAccounts(ctx context.Context, r *pb.GetAccountsRequest) (*pb.GetAccountsResponse, error) {
	res, newAccessToken, newRefreshToken, err := s.service.GetAccounts(ctx, r.Skip, r.Take, r.AccessToken, r.RefreshToken)
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
	return &pb.GetAccountsResponse{
		Accounts:     accounts,
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
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
	newAccessToken, err := GenerateAccessToken(claims.Username, claims.Role)
	if err != nil {
		return nil, err
	}

	return &pb.RefreshTokenResponse{
		AccessToken: newAccessToken,
	}, nil
}

func (s *grpcServer) SetAccountAsAdmin(ctx context.Context, r *pb.SetAccountAsAdminRequest) (*pb.SetAccountAsAdminResponse, error) {
	p, newAccessToken, newRefreshToken, err := s.service.SetAccountAsAdmin(ctx, r.AccessToken, r.RefreshToken, r.Id)
	if err != nil {
		return nil, err
	}
	return &pb.SetAccountAsAdminResponse{
		Account: &pb.Account{
			Id:           p.ID,
			FirstName:    p.FirstName,
			LastName:     p.LastName,
			Email:        p.Email,
			PasswordHash: p.PasswordHash,
			Role:         p.Role,
		},
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *grpcServer) ForgotPassword(ctx context.Context, r *pb.ForgotPasswordRequest) (*pb.ForgotPasswordResponse, error) {
	account, err := s.service.ForgotPassword(ctx, r.Email, r.FirstName, r.LastName)
	if err != nil {
		return nil, err
	}
	return &pb.ForgotPasswordResponse{
		Account: &pb.Account{
			Id:           account.ID,
			FirstName:    account.FirstName,
			LastName:     account.LastName,
			Email:        account.Email,
			PasswordHash: account.PasswordHash,
			Role:         account.Role,
		},
	}, nil
}

func (s *grpcServer) ResetPassword(ctx context.Context, r *pb.ResetPasswordRequest) (*pb.ResetPasswordResponse, error) {
	account, err := s.service.ResetPassword(ctx, r.Id, r.Email, r.Password)
	if err != nil {
		return nil, err
	}
	return &pb.ResetPasswordResponse{
		Account: &pb.Account{
			Id:           account.ID,
			FirstName:    account.FirstName,
			LastName:     account.LastName,
			Email:        account.Email,
			PasswordHash: account.PasswordHash,
			Role:         account.Role,
		},
	}, nil
}
