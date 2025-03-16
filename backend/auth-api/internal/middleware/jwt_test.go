package middleware_test

import (
	"testing"

	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
)

func TestCreateJWT(t *testing.T) {
	testUser := models.User{
		Email: "test@gmail.com",
	}
	tokenString, err := middleware.CreateToken(testUser)
	if err != nil {
		t.Errorf("Failed to create token for user %s", testUser.Email)
	}
	t.Log(tokenString)
}
