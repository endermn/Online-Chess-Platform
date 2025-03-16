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

func Init(config *config.Config) (*Application, error) {
	// Initialize database, services and handlers
	db, err := postgres.Init(config.DBConfig)
	if err != nil {
		return nil, err
	}

	app := &Application{
		config: config,
		router: setupRoutes(db),
	}

	return app, nil
}

func (a *Application) Handler() http.Handler {
	return a.router
}
