package middleware_test

import (
	"testing"

	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
)

func TestCreateJWT(t *testing.T) {
	username := "tosho@gmail.com"
	middleware.GenerateKey()
	tokenString, err := middleware.CreateToken(username)
	if err != nil {
		t.Errorf("Failed to create token for user %s", username)
	}
	t.Log(tokenString)
}
