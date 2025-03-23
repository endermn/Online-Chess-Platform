package middleware_test

import (
	"testing"

	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/endermn/Thesis/backend/auth-api/internal/security"
)

func TestCreateJWT(t *testing.T) {
	pass, err := security.HashPassword("password123")
	if err != nil {
		t.Errorf("Failed to hash password: %s : %s", pass, err)
	}
	testUser := models.User{
		Email:        "testuser@example.com",
		PasswordHash: pass,
	}
	tokenString, err := middleware.CreateToken(testUser)
	if err != nil {
		t.Errorf("Failed to create token for user %s", testUser.Email)
	}
	t.Log(tokenString)
}
