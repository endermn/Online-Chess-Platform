package app

import (
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/handlers"
	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupRoutes(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	rateLimiter := middleware.NewRateLimiter(5, time.Minute)

	router.Use(rateLimiter.RateLimitMiddleware())

	router.GET("/status", handlers.StatusHandler)
	router.GET("/profile", handlers.ProfileHandler(db))
	router.GET("/user/stats", handlers.UserStatsHandler(db))

	router.POST("/signup", handlers.SignupHandler(db))
	router.POST("/login", handlers.LoginHandler(db))
	router.POST("/logout", handlers.LogoutHandler)

	return router
}
