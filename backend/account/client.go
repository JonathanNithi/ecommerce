package account

import (
	"context"

	"github.com/JonathanNithi/ecommerce/backend/account/pb"
	"google.golang.org/grpc"
)

type Client struct {
	conn    *grpc.ClientConn
	service pb.AccountServiceClient
}

func NewClient(url string) (*Client, error) {
	conn, err := grpc.Dial(url, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	c := pb.NewAccountServiceClient(conn)
	return &Client{conn, c}, nil
}

func (c *Client) Close() {
	c.conn.Close()
}

func (c *Client) PostAccount(ctx context.Context, first_name string, last_name string, email string, password string) (*Account, error) {
	r, err := c.service.PostAccount(
		ctx,
		&pb.PostAccountRequest{FirstName: first_name,
			LastName:     last_name,
			Email:        email,
			PasswordHash: password,
		},
	)
	if err != nil {
		return nil, err
	}
	return &Account{
		ID:           r.Account.Id,
		FirstName:    r.Account.FirstName,
		LastName:     r.Account.LastName,
		Email:        r.Account.Email,
		PasswordHash: r.Account.PasswordHash,
	}, nil
}

func (c *Client) GetAccount(ctx context.Context, id string) (*Account, error) {
	r, err := c.service.GetAccount(
		ctx,
		&pb.GetAccountRequest{Id: id},
	)
	if err != nil {
		return nil, err
	}
	return &Account{
		ID:        r.Account.Id,
		FirstName: r.Account.FirstName,
		LastName:  r.Account.LastName,
		Email:     r.Account.Email,
	}, nil
}

func (c *Client) GetAccounts(ctx context.Context, skip uint64, take uint64) ([]Account, error) {
	r, err := c.service.GetAccounts(
		ctx,
		&pb.GetAccountsRequest{
			Skip: skip,
			Take: take,
		},
	)
	if err != nil {
		return nil, err
	}
	accounts := []Account{}
	for _, a := range r.Accounts {
		accounts = append(accounts, Account{
			ID:        a.Id,
			FirstName: a.FirstName,
			LastName:  a.LastName,
			Email:     a.Email,
		})
	}
	return accounts, nil
}
