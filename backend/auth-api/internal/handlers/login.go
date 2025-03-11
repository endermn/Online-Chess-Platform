package handlers

import (
	"log"
	"net/http"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/endermn/Thesis/backend/auth-api/internal/security"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LoginParams struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var params LoginParams
		c.Bind(&params)

		var user models.User

		err := db.Take(&user, "email = ?", params.Email).Error

		if err == gorm.ErrRecordNotFound {
			c.String(http.StatusBadRequest, "No such email or password")
			return
		} else if err != nil {
			log.Printf("Error while taking from database: %s", err)
			c.String(http.StatusInternalServerError, "Unexpected error")
			return
		}

		if !security.VerifyPassword(params.Password, user.PasswordHash) {
			c.String(http.StatusBadRequest, "No such email or password")
			return
		}

		c.Header("Content-Type", "application/json")
		c.JSON(200, struct{}{})
	}
}
