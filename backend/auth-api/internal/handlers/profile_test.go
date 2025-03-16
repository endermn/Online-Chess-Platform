package handlers_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/endermn/Thesis/backend/auth-api/internal/handlers"
	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestProfileHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	config := postgres.Config{
		User:     "postgres",
		Password: "4294",
		Addr:     "localhost:5432",
		DBName:   "test_db",
	}
	db, err := postgres.Init(config)
	if err != nil {
		t.Fatalf("Failed to init postgres database: %s", err)
	}

	db.Exec("TRUNCATE games, statistics, users, news;")

	testUser := models.User{
		Email:        "test@example.com",
		FullName:     "Test User",
		PasswordHash: "hashedpassword",
	}
	db.Create(&testUser)

	router := gin.Default()

	router.GET("/profile", handlers.ProfileHandler(db))

	t.Run("Success Case - Valid Token", func(t *testing.T) {
		token, err := middleware.CreateToken(testUser)
		if err != nil {
			t.Fatalf("Failed to generate test JWT token: %v", err)
		}

		req, _ := http.NewRequest("GET", "/profile", nil)
		req.AddCookie(&http.Cookie{
			Name:  "sess_token",
			Value: token,
		})
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Fatalf("Invalid response")
		}

		var responseUser models.User
		err = json.Unmarshal(w.Body.Bytes(), &responseUser)
		if err != nil {
			t.Fatalf("Failed to unmarshal response: %v", err)
		}

		if testUser.Email != responseUser.Email || testUser.FullName != responseUser.FullName {
			t.Fatalf("Invalid data returned from db")
		}
	})

	t.Run("Failure Case - No Cookie", func(t *testing.T) {
		// Create a test request without cookie
		req, _ := http.NewRequest("GET", "/profile", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "failed to find cookie")
	})

	t.Run("Failure Case - Invalid Token", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/profile", nil)
		req.AddCookie(&http.Cookie{
			Name:  "sess_token",
			Value: "invalid.token.string",
		})
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assert.Contains(t, w.Body.String(), "Unexpected error occured")
	})

	t.Run("Failure Case - User Not Found", func(t *testing.T) {
		token, err := middleware.CreateToken(models.User{Email: "nonexistant@gmail.com"})
		if err != nil {
			t.Fatalf("Failed to generate test JWT token: %v", err)
		}

		req, _ := http.NewRequest("GET", "/profile", nil)
		req.AddCookie(&http.Cookie{
			Name:  "sess_token",
			Value: token,
		})
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assert.Contains(t, w.Body.String(), "Unexpected error occured")
	})
}
