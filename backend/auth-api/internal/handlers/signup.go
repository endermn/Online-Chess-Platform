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

type SignupParams struct {
	FullName string `json:"fullname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func SignupHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var params SignupParams
		err := c.BindJSON(&params)
		if err != nil {
			return
		}

		var user models.User

		err = db.Take(&user, "email = ?", params.Email).Error
		if err != gorm.ErrRecordNotFound {
			c.String(http.StatusBadRequest, "User already exists")
			return
		}

		if len(params.Password) < 8 {
			c.String(http.StatusBadRequest, "Password should be at least 8 characters long")
		}

		hash, err := security.HashPassword(params.Password)
		if err != nil {
			log.Printf("Issue while hashing password: %s on user with email: %s", err, params.Email)
			c.String(http.StatusInternalServerError, "Unexpected error occured")
		}
		user = models.User{
			FullName:     params.FullName,
			Email:        params.Email,
			PasswordHash: hash,
			IsActive:     true,
			CreatedAt:    time.Now(),
			LastLogin:    time.Now(),
		}

		err = db.Create(&user).Error
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed while creating user: %s", params.Email)
			return
		}

		token, err := middleware.CreateToken(user.PublicID)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to create token for user: %s", user.Email)
		}
		c.SetCookie("user", token, 3600*24, "/", "localhost", false, true)

		c.Header("Content-Type", "application/json")
		c.String(http.StatusOK, "Cookie has been set")
	}
}
