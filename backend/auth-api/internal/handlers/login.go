package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
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

		token, err := middleware.CreateToken(user)
		if err != nil {
			log.Printf("Failed to create token for user: %v", user.Email)
			log.Print(err)
			c.String(http.StatusInternalServerError, "Unexpected error")
			return
		}

		user.LastLogin = time.Now()

		err = db.Save(&user).Error
		if err != nil {
			log.Printf("Failed to save user to database")
		}

		// expiration := time.Now().Add(24 * time.Hour)
		c.SetCookie("sess_token", token, 3600*24, "/", "", false, true)

		// http.SetCookie(c.Writer, &http.Cookie{
		// 	Name:     "sess_token",
		// 	Value:    token,
		// 	MaxAge:   3600 * 24,
		// 	Path:     "/",
		// 	Domain:   "localhost",
		// 	SameSite: http.SameSiteNoneMode,
		// 	Secure:   false,
		// 	HttpOnly: true,
		// })

		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, "Cookie has been set")
	}
}
