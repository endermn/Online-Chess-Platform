package handlers_test

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/handlers"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	"github.com/endermn/Thesis/backend/auth-api/internal/security"
	testutils "github.com/endermn/Thesis/backend/auth-api/pkg/test-utils"
	"github.com/gin-gonic/gin"
)

func TestLoginHandler(t *testing.T) {
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

	test_pem := "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEINRde7gen5gEY4BpiUOa/8ng2MKctPPJTaAbee3bha2UoAoGCCqGSM49\nAwEHoUQDQgAE5tTLdebVfUZNpF/soUsHPB65UFEctl0VfE+ysXxTSiWj2BZ5ZXbr\nlJ2U0oHkkvU4C4sEArRBelU7jv2fGrLxRA==\n-----END EC PRIVATE KEY-----"

	t.Setenv("PEM_KEY", test_pem)

	db.Exec("TRUNCATE games, statistics, users, news, sessions;")

	router := gin.Default()
	router.POST("/login", handlers.LoginHandler(db))
	hash, err := security.HashPassword("password123")
	if err != nil {
		t.Fatalf("error while hashing password")
	}

	user := models.User{
		FullName:     "test",
		Email:        "testuser@example.com",
		PasswordHash: hash,
		IsActive:     true,
		CreatedAt:    time.Now(),
		LastLogin:    time.Now(),
	}

	err = db.Create(&user).Error
	if err != nil {
		t.Logf("Failed while creating user: %s", user.Email)
	}

	jsonStr := fmt.Sprintf(`{
		"email":"%s",
		"password":"%s"
	}`, user.Email, "password123")

	req := testutils.NewRequest(http.MethodPost, "/login", bytes.NewBufferString(jsonStr))

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Failed to login user: %v", w.Body)
	}

	cookies := w.Result().Cookies()
	t.Logf("Cookies found: %d", len(cookies))
	for _, cookie := range cookies {
		t.Logf("Cookie: Name=%s, Value=%s, Path=%s, Domain=%s, Expires=%v, HttpOnly=%v, Secure=%v",
			cookie.Name,
			cookie.Value,
			cookie.Path,
			cookie.Domain,
			cookie.Expires,
			cookie.HttpOnly,
			cookie.Secure,
		)
	}
}
