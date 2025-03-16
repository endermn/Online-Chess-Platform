package config

import (
	"log"
	"os"
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
	requestTimeout := 30
	shutdownTimeout := 30

	return &Config{
		DBConfig: postgres.Config{
			User:     GetEnv("POSTGRES_USER"),
			Password: GetEnv("POSTGRES_PASSWORD"),
			Addr:     "localhost:5432",
			DBName:   GetEnv("POSTGRES_DB"),
		},
		RequestTimeout:  time.Duration(requestTimeout) * time.Second,
		ShutdownTimeout: time.Duration(shutdownTimeout) * time.Second,
	}, nil
}

func GetEnv(key string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}

	log.Fatalf("Failed to fetch env variable, key: %v", key)
	return ""
}
