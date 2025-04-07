package app

import (
	"log"
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func setupRoutes(db *gorm.DB) *gin.Engine {
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"POST", "OPTIONS", "GET", "PUT", "DELETE"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	config.AllowCredentials = true
	config.MaxAge = 12 * time.Hour

	router.Use(cors.New(config))

	router.GET("/status", handlers.StatusHandler)
	router.GET("/profile", handlers.ProfileHandler(db))
	router.GET("/user/stats", handlers.UserStatsHandler(db))
	router.GET("/user/recent", handlers.UserRecentGamesHandler(db))
	router.GET("/puzzle/random", handlers.GetRandomPuzzle(db))
	router.GET("/news", handlers.NewsHandler(db))

	router.POST("/signup", handlers.SignupHandler(db))
	router.POST("/login", handlers.LoginHandler(db))
	router.POST("/logout", handlers.LogoutHandler)

	router.GET("/game/create", handlers.GameHandler(db))

	router.OPTIONS("/game/create", func(c *gin.Context) {
		log.Printf("OPTIONS request received for /game/create")
		log.Printf("Request Headers: %+v", c.Request.Header)
		c.Status(204) // No Content
	})

	router.GET("/ws/game", handlers.GameHandler(db))

	adminRoutes := router.Group("/admin")
	adminRoutes.Use(handlers.AdminAuthMiddleware(db))
	{
		adminRoutes.GET("/users", handlers.GetUsers(db))
		adminRoutes.DELETE("/users/:id", handlers.DeleteUser(db))
	}

	return router
}
