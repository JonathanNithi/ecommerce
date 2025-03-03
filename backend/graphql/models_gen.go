// Code generated by github.com/99designs/gqlgen, DO NOT EDIT.

package main

import (
	"fmt"
	"io"
	"strconv"
	"time"
)

type AccountInput struct {
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Email        string `json:"email"`
	PasswordHash string `json:"password_hash"`
}

type LoginResponse struct {
	Account      *Account `json:"account"`
	AccessToken  string   `json:"accessToken"`
	RefreshToken string   `json:"refreshToken"`
}

type Mutation struct {
}

type Order struct {
	ID         string            `json:"id"`
	CreatedAt  time.Time         `json:"createdAt"`
	TotalPrice float64           `json:"totalPrice"`
	Products   []*OrderedProduct `json:"products"`
}

type OrderInput struct {
	AccountID string               `json:"accountId"`
	Products  []*OrderProductInput `json:"products"`
}

type OrderProductInput struct {
	ID       string `json:"id"`
	Quantity int    `json:"quantity"`
}

type OrderedProduct struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
}

type PaginationInput struct {
	Skip *int `json:"skip,omitempty"`
	Take *int `json:"take,omitempty"`
}

type Product struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Description  string   `json:"description"`
	Price        float64  `json:"price"`
	Category     string   `json:"category"`
	ImageURL     string   `json:"imageUrl"`
	Tags         []string `json:"tags,omitempty"`
	Availability bool     `json:"availability"`
	Stock        int      `json:"stock"`
}

type ProductInput struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Price       float64  `json:"price"`
	Category    string   `json:"category"`
	ImageURL    string   `json:"imageUrl"`
	Tags        []string `json:"tags,omitempty"`
	Stock       int      `json:"stock"`
}

type Query struct {
}

type Role string

const (
	RoleUser  Role = "user"
	RoleAdmin Role = "admin"
)

var AllRole = []Role{
	RoleUser,
	RoleAdmin,
}

func (e Role) IsValid() bool {
	switch e {
	case RoleUser, RoleAdmin:
		return true
	}
	return false
}

func (e Role) String() string {
	return string(e)
}

func (e *Role) UnmarshalGQL(v any) error {
	str, ok := v.(string)
	if !ok {
		return fmt.Errorf("enums must be strings")
	}

	*e = Role(str)
	if !e.IsValid() {
		return fmt.Errorf("%s is not a valid Role", str)
	}
	return nil
}

func (e Role) MarshalGQL(w io.Writer) {
	fmt.Fprint(w, strconv.Quote(e.String()))
}
