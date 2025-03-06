package app

import (
	"github.com/endermn/Thesis/backend/auth-api/internal/handlers"
	"github.com/gin-gonic/gin"
)

func (a *Application) setupRoutes() *gin.Engine {
	router := gin.Default()

	router.Use()
	router.GET("/status", handlers.StatusHandler)

	return router
}
