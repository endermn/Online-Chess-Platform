package app

import (
	"net/http"

	"github.com/endermn/Thesis/backend/auth-api/pkg/config"
	"github.com/gin-gonic/gin"
)

type Application struct {
	config *config.Config
	router *gin.Engine
}

func Init(config *config.Config) (*Application, error) {
	//Initialize database, services and handlers
	app := &Application{
		config: config,
	}

	return app, nil
}

func (a *Application) Handler() http.Handler {
	return a.router
}
