package app

import (
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/handlers"
	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupRoutes(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	// rateLimiter := middleware.NewRateLimiter(5, time.Minute)

	// router.Use(rateLimiter.RateLimitMiddleware())
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"POST", "OPTIONS", "GET", "PUT", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	// router.Use(middleware.CorsMiddleware())
	router.Use(cors.New(config))

	router.GET("/status", handlers.StatusHandler)
	router.GET("/profile", handlers.ProfileHandler(db))
	router.GET("/user/stats", handlers.UserStatsHandler(db))
	router.GET("/ws", handlers.WebsocketHandler)
	router.GET("/puzzle/random", handlers.GetRandomPuzzle(db))

	router.POST("/signup", handlers.SignupHandler(db))
	router.POST("/login", handlers.LoginHandler(db))
	router.POST("/logout", handlers.LogoutHandler)
	router.POST("/game/create", middleware.AuthMiddleware(), handlers.GameHandler(db))

	return router
}
