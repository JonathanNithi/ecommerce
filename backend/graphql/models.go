package main

type Account struct {
	ID           string  `json:"id"`
	FirstName    string  `json:"first_name"`
	LastName     string  `json:"last_name"`
	Email        string  `json:"email"`
	PasswordHash string  `json:"password_hash"`
	Role         string  `json:"role"`
	Orders       []Order `json:"orders"`
}
