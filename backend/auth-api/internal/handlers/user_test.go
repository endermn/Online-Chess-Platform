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

func TestUserStatsHandler(t *testing.T) {
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
	db.Exec("TRUNCATE games, statistics, users, news, sessions;")

	testUser := models.User{
		Email:        "test@example.com",
		FullName:     "Test User",
		PasswordHash: "hashedpassword",
	}
	result := db.Create(&testUser)
	if result.Error != nil {
		t.Fatalf("Failed to create test user: %v", result.Error)
	}

	testStats := models.Statistic{
		UserID:     testUser.ID,
		GamesWon:   5,
		GamesLost:  10,
		TotalGames: 15,
	}
	db.Create(&testStats)

	router := gin.Default()
	router.GET("/user/stats", handlers.UserStatsHandler(db))

	t.Run("Success Case - Valid Token", func(t *testing.T) {
		token, err := middleware.CreateToken(testUser)
		if err != nil {
			t.Fatalf("Failed to generate test JWT token: %v", err)
		}

		req, _ := http.NewRequest("GET", "/user/stats", nil)
		req.AddCookie(&http.Cookie{
			Name:  "sess_token",
			Value: token,
		})

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var responseStats models.Statistic
		err = json.Unmarshal(w.Body.Bytes(), &responseStats)
		if err != nil {
			t.Fatalf("Failed to unmarshal response: %v", err)
		}

		assert.Equal(t, testStats.UserID, responseStats.UserID)
		assert.Equal(t, testStats.GamesWon, responseStats.GamesWon)
	})

	t.Run("Failure Case - No Cookie", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/user/stats", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusUnauthorized, w.Code)
		assert.Contains(t, w.Body.String(), "failed to find cookie")
	})

	t.Run("Failure Case - Invalid Token", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/user/stats", nil)
		req.AddCookie(&http.Cookie{
			Name:  "sess_token",
			Value: "invalid.token.string",
		})

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusInternalServerError, w.Code)
		assert.Contains(t, w.Body.String(), "Unexpected error occured")
	})

	t.Run("Failure Case - Stats Not Found", func(t *testing.T) {
		// Create a new user with no stats
		newUser := models.User{
			Email:        "noStats@example.com",
			FullName:     "No Stats User",
			PasswordHash: "hashedpassword",
		}
		db.Create(&newUser)

		// Create a token that includes the proper ID field
		token, err := middleware.CreateToken(newUser)
		if err != nil {
			t.Fatalf("Failed to generate test JWT token: %v", err)
		}

		req, _ := http.NewRequest("GET", "/user/stats", nil)
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
