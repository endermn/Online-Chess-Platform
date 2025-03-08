package app

import (
	"net/http"

	"github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	"github.com/endermn/Thesis/backend/auth-api/pkg/config"
	"github.com/gin-gonic/gin"
)

type Application struct {
	config *config.Config
	router *gin.Engine
}

// Init initializes an Application instance using the provided configuration. It establishes a PostgreSQL connection with the database settings in config.DBConfig and sets up the HTTP routes. It returns the Application instance if successful or an error if the database initialization fails.
func Init(config *config.Config) (*Application, error) {
	// Initialize database, services and handlers

	err := postgres.Init(config.DBConfig)
	if err != nil {
		return nil, err
	}

	app := &Application{
		config: config,
		router: setupRoutes(),
	}

	return app, nil
}

func (a *Application) Handler() http.Handler {
	if a.router == nil {
		setupRoutes()
	}
	return a.router
}
