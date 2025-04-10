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
	GetAccountByEmail(ctx context.Context, email string) (*Account, error)
	GetAccountByEmailAndName(ctx context.Context, first_name string, last_name string, email string) (*Account, error)
	GetAccountById(ctx context.Context, id string) (*Account, error)
	UpdateAccountRole(ctx context.Context, id string, role string) (*Account, error)
	UpdatePasswordHash(ctx context.Context, email string, passwordHash string) (*Account, error)
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

func (r *postgresRepository) GetAccountByEmail(ctx context.Context, email string) (*Account, error) {
	row := r.db.QueryRowContext(
		ctx,
		"SELECT id, first_name, last_name, email, password_hash, role FROM accounts WHERE email = $1",
		email,
	)
	account := &Account{}
	if err := row.Scan(&account.ID, &account.FirstName, &account.LastName, &account.Email, &account.PasswordHash, &account.Role); err != nil {
		return nil, err // Return error if no account is found
	}
	return account, nil
}

func (r *postgresRepository) GetAccountByEmailAndName(ctx context.Context, first_name string, last_name string, email string) (*Account, error) {
	row := r.db.QueryRowContext(
		ctx,
		"SELECT id, first_name, last_name, email, password_hash, role FROM accounts WHERE email = $1 AND first_name = $2 AND last_name = $3",
		email, first_name, last_name,
	)
	account := &Account{}
	if err := row.Scan(&account.ID, &account.FirstName, &account.LastName, &account.Email, &account.PasswordHash, &account.Role); err != nil {
		return nil, err // Return error if no account is found
	}
	return account, nil
}

func (r *postgresRepository) GetAccountById(ctx context.Context, id string) (*Account, error) {
	row := r.db.QueryRowContext(
		ctx,
		"SELECT id, first_name, last_name, email, password_hash, role FROM accounts WHERE id = $1",
		id,
	)
	account := &Account{}
	if err := row.Scan(&account.ID, &account.FirstName, &account.LastName, &account.Email, &account.PasswordHash, &account.Role); err != nil {
		return nil, err // Return error if no account is found
	}
	return account, nil
}

func (r *postgresRepository) UpdateAccountRole(ctx context.Context, id string, role string) (*Account, error) {
	_, err := r.db.ExecContext(
		ctx,
		"UPDATE accounts SET role = $1 WHERE id = $2",
		role, id,
	)

	row := r.db.QueryRowContext(
		ctx,
		"SELECT id, first_name, last_name, email, password_hash, role FROM accounts WHERE id = $1",
		id,
	)
	account := &Account{}
	if err := row.Scan(&account.ID, &account.FirstName, &account.LastName, &account.Email, &account.PasswordHash, &account.Role); err != nil {
		return nil, err // Return error if no account is found
	}

	return account, err
}

func (r *postgresRepository) UpdatePasswordHash(ctx context.Context, email string, passwordHash string) (*Account, error) {
	_, err := r.db.ExecContext(
		ctx,
		"UPDATE accounts SET password_hash = $1 WHERE email = $2",
		passwordHash, email,
	)

	row := r.db.QueryRowContext(
		ctx,
		"SELECT id, first_name, last_name, email, password_hash, role FROM accounts WHERE email = $1",
		email,
	)
	account := &Account{}
	if err := row.Scan(&account.ID, &account.FirstName, &account.LastName, &account.Email, &account.PasswordHash, &account.Role); err != nil {
		return nil, err // Return error if no account is found
	}

	return account, err
}
