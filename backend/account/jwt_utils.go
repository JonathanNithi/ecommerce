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

func (s *accountService) validateAndRegenerateToken(ctx context.Context, accessToken string, refreshToken string) (newAccessToken string, newRefreshToken string, claims *Claims, err error) {
	// Validate the access token (we might just check for expiry here)
	accessClaims, accessErr := ValidateToken(accessToken)

	// Validate the refresh token
	refreshClaims, refreshErr := ValidateToken(refreshToken)
	if refreshErr != nil {
		return "", "", nil, refreshErr // Refresh token is invalid, force re-login
	}

	if accessErr != nil && accessErr == jwt.ErrTokenExpired {
		// Access token is expired, use the refresh token to get a new one
		newAccessToken, err = GenerateAccessToken(refreshClaims.Username, refreshClaims.Role)
		if err != nil {
			return "", "", nil, err
		}
		newRefreshToken, err = GenerateRefreshToken(refreshClaims.Username, refreshClaims.Role) // Optional: Rotate refresh token
		if err != nil {
			return "", "", nil, err
		}
		return newAccessToken, newRefreshToken, refreshClaims, nil
	} else if accessErr != nil {
		// Access token is invalid for other reasons
		return "", "", nil, accessErr
	}

	// Access token is still valid
	return accessToken, refreshToken, accessClaims, nil
}
