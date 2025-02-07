package account

import (
	"context"
	"database/sql"

	_ "github.com/lib/pq"
)

type Repository interface {
	Close()
	PutAccount(ctx context.Context, a Account) error
	GetAccountByID(ctx context.Context, id string) (*Account, error)
	ListAccounts(ctx context.Context, skip uint64, take uint64) ([]Account, error)
}

type postgresRepository struct {
	db *sql.DB
}

func NewPostgresRepository(url string) (Repository, error) {
	db, err := sql.Open("postgres", url)
	if err != nil {
		return nil, err
	}

	err = db.Ping()
	if err != nil {
		return nil, err
	}

	return &postgresRepository{db}, nil
}

func (r *postgresRepository) Close() {
	r.db.Close()
}

func (r *postgresRepository) Ping() error {
	return r.db.Ping()
}

func (r *postgresRepository) PutAccount(ctx context.Context, a Account) error {
	_, err := r.db.ExecContext(
		ctx,
		"INSERT INTO accounts(id, first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)",
		a.ID, a.FirstName, a.LastName, a.Email, a.PasswordHash, a.Role,
	)
	return err
}

func (r *postgresRepository) GetAccountByID(ctx context.Context, id string) (*Account, error) {
	row := r.db.QueryRowContext(
		ctx,
		"SELECT id, first_name, last_name, email, password_hash, role FROM accounts WHERE id = $1",
		id,
	)
	a := &Account{}
	if err := row.Scan(&a.ID, &a.FirstName, &a.LastName, &a.Email, &a.PasswordHash, &a.Role); err != nil {
		return nil, err
	}
	return a, nil
}

func (r *postgresRepository) ListAccounts(ctx context.Context, skip uint64, take uint64) ([]Account, error) {
	rows, err := r.db.QueryContext(
		ctx,
		"SELECT id, first_name, last_name, email, password_hash, role FROM accounts ORDER BY id DESC OFFSET $1 LIMIT $2",
		skip, take,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	accounts := []Account{}
	for rows.Next() {
		a := &Account{}
		// Scan the result into the Account struct
		if err = rows.Scan(&a.ID, &a.FirstName, &a.LastName, &a.Email, &a.PasswordHash, &a.Role); err == nil {
			accounts = append(accounts, *a)
		}
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return accounts, nil
}
