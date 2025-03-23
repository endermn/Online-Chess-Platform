package handlers_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/handlers"
	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	"github.com/endermn/Thesis/backend/auth-api/internal/security"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func TestGameCreation(t *testing.T) {
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

	db.AutoMigrate(&models.Game{})

	// Create a test server
	router := gin.Default()
	router.GET("/game/create", middleware.AuthMiddleware(), handlers.GameHandler(db))
	server := httptest.NewServer(router)
	defer server.Close()

	// Create a user and get authentication token
	pass, err := security.HashPassword("password123")
	if err != nil {
		t.Fatalf("Failed while hashing password: %v", err)
	}
	user := models.User{
		ID:           1,
		FullName:     "test test",
		Email:        "testuser@example.com",
		PasswordHash: pass,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("Failed to create user in db: %v", err)
	}

	token, err := middleware.CreateToken(user)
	if err != nil {
		t.Fatalf("Failed to create token for user: %v", err)
	}

	// Convert http URL to websocket URL
	wsURL := strings.Replace(server.URL, "http://", "ws://", 1) + "/game/create"

	// Connect to the websocket
	dialer := websocket.Dialer{
		Proxy:            http.ProxyFromEnvironment,
		HandshakeTimeout: 5 * time.Second,
	}

	header := http.Header{}
	header.Add("Authorization", "Bearer "+token)

	conn, resp, err := dialer.Dial(wsURL, header)
	if err != nil {
		t.Fatalf("Failed to connect to websocket: %v, response: %v", err, resp)
	}
	defer conn.Close()

	// Here you can test the actual websocket communication
	// For example:
	// Send a message
	err = conn.WriteMessage(websocket.TextMessage, []byte("test message"))
	if err != nil {
		t.Fatalf("Failed to send message: %v", err)
	}
	// Read response
	messageType, message, err := conn.ReadMessage()
	if err != nil {
		t.Fatalf("Failed to read message: %v", err)
	}

	t.Logf("Message type: %v \n message: %v", messageType, message)

	// A simple check that connection succeeded
	if resp.StatusCode != http.StatusSwitchingProtocols {
		t.Fatalf("Expected Status Switching Protocols but got: %d", resp.StatusCode)
	}
}
