package handlers

import (
	"log"
	"net/http"

	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func UserStatsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie("sess_token")
		if err != nil {
			c.String(http.StatusUnauthorized, "failed to find cookie")
			return
		}

		claims, err := middleware.ExtractJWTPayload(token)
		if err != nil {
			c.String(http.StatusInternalServerError, "Unexpected error occured")
			log.Printf("Failed to extract JWT Payload on token: %v", token)
			return
		}

		idValue, ok := claims["id"]
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: missing user ID")
			return
		}
		user_id, ok := idValue.(float64)
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: user ID is not a string")
			return
		}

		var user_stats models.Statistic

		err = db.Take(&user_stats, "user_id = ?", user_id).Error
		if err != nil {
			c.String(http.StatusInternalServerError, "Unexpected error occured")
			return
		}

		c.JSON(http.StatusOK, user_stats)
	}
}
