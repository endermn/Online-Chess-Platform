package handlers

import (
	"log"
	"net/http"

	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ProfileHandler(db *gorm.DB) gin.HandlerFunc {
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

		email := claims["email"].(string)

		var user models.User

		err = db.Take(&user, "email = ?", email).Error
		if err != nil {
			c.String(http.StatusInternalServerError, "Unexpected error occured")
			return
		}

		user.PasswordHash = ""

		c.JSON(http.StatusOK, user)
	}

}
