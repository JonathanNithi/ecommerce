package account

import (
	"context"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte(os.Getenv("SECRET_KEY")) // Replace with a secure secret key

type Claims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateAccessToken generates a new access token
func GenerateAccessToken(username string, role string) (string, error) {
	expirationTime := time.Now().Add(15 * time.Minute) // Access token expires in 15 minutes
	claims := &Claims{
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// GenerateRefreshToken generates a new refresh token
func GenerateRefreshToken(username string, role string) (string, error) {
	expirationTime := time.Now().Add(7 * 24 * time.Hour) // Refresh token expires in 7 days
	claims := &Claims{
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// ValidateToken validates a JWT token and returns the claims
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	if claims.ExpiresAt.Time.Before(time.Now()) {
		return nil, jwt.ErrTokenExpired
	}

	return claims, nil
}

func (s *accountService) validateAndRegenerateToken(ctx context.Context, accessToken string, refreshToken string) (*Claims, error) {
	// Validate the access token
	claims, err := ValidateToken(accessToken)
	if err != nil {
		return nil, err
	}

	// Validate the refresh token
	_, err = ValidateToken(refreshToken)
	if err != nil {
		return nil, err
	}

	// Regenerate the access token if it’s expired
	if claims.ExpiresAt.Before(time.Now()) {
		accessToken, err = GenerateAccessToken(claims.Username, claims.Role)
		if err != nil {
			return nil, err
		}
	}
	return claims, nil
}
