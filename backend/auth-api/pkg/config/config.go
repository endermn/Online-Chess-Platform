package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds all application configuration
type Config struct {
	ServerAddress   string
	DatabaseURL     string
	Environment     string
	LogLevel        string
	RequestTimeout  time.Duration
	ShutdownTimeout time.Duration
}

func Load() (*Config, error) {
	requestTimeout, _ := strconv.Atoi(getEnv("REQUEST_TIMEOUT_SECONDS", "30"))
	shutdownTimeout, _ := strconv.Atoi(getEnv("SHUTDOWN_TIMEOUT_SECONDS", "30"))

	return &Config{
		ServerAddress:   getEnv("SERVER_ADDRESS", ":3000"),
		DatabaseURL:     getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/myapp?sslmode=disable"),
		Environment:     getEnv("ENVIRONMENT", "development"),
		LogLevel:        getEnv("LOG_LEVEL", "info"),
		RequestTimeout:  time.Duration(requestTimeout) * time.Second,
		ShutdownTimeout: time.Duration(shutdownTimeout) * time.Second,
	}, nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
