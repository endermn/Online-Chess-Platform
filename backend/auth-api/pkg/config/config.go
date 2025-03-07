package config

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
)

// Config holds all application configuration

type Config struct {
	DBConfig        postgres.Config
	Environment     string
	LogLevel        string
	RequestTimeout  time.Duration
	ShutdownTimeout time.Duration
}

func Load() (*Config, error) {
	requestTimeout, err := strconv.Atoi(getEnv("REQUEST_TIMEOUT_SECONDS", "30"))
	if err != nil {
		log.Printf("Invalid REQUEST_TIMEOUT_SECONDS value: %s", err)
	}
	shutdownTimeout, err := strconv.Atoi(getEnv("SHUTDOWN_TIMEOUT_SECONDS", "30"))
	if err != nil {
		log.Printf("Invalid SHUTDOWN_TIMEOUT_SECONDS value: %s", err)
	}

	return &Config{
		DBConfig: postgres.Config{
			User:     getEnv("POSTGRES_USER", "postgres"),
			Password: getEnv("POSTGRES_PASSWORD", "postgres"),
			Addr:     getEnv("DB_ADDR", "localhost:3000"),
			DBName:   getEnv("POSTGRES_DB", "myapp"),
		},
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
