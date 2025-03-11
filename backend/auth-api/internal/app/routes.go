package app

import (
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/handlers"
	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/repository/postgres"
	"github.com/gin-gonic/gin"
)

func setupRoutes() *gin.Engine {
	router := gin.Default()

	rateLimiter := middleware.NewRateLimiter(5, time.Minute)

	router.Use(rateLimiter.RateLimitMiddleware())
	router.GET("/status", handlers.StatusHandler)
	router.POST("/signup", handlers.SignupHandler(postgres.DB))

	return router
}
