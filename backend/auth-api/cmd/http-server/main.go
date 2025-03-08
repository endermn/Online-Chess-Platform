package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/app"
	"github.com/endermn/Thesis/backend/auth-api/pkg/config"
)

// main loads configuration, initializes the application, and starts an HTTP server listening on port 3000.
// It runs the server in a separate goroutine and awaits SIGINT or SIGTERM signals to initiate a graceful shutdown,
// allowing up to 30 seconds for ongoing operations to complete before the server exits.
func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	application, err := app.Init(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize application: %v", err)
	}

	// Set up HTTP server
	server := &http.Server{
		Addr:         ":3000",
		Handler:      application.Handler(),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Set up graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited properly")
}
