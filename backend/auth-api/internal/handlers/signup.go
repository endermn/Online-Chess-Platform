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
		if err == nil {
			c.String(http.StatusBadRequest, "User already exists")
			return
		}

		if err != gorm.ErrRecordNotFound {
			log.Printf("Failed while looking up record: %v", err)
			c.String(http.StatusInternalServerError, "Unexpected error")
			return
		}

		if len(params.Password) < 8 {
			c.String(http.StatusBadRequest, "Password should be at least 8 characters long")
			return
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
			c.String(http.StatusInternalServerError, "Unexpected error")
			log.Printf("Failed while creating user: %v", err)
			return
		}

		userStats := models.Statistic{
			BulletRating:    500,
			BlitzRating:     500,
			RapidRating:     500,
			ClassicalRating: 500,
			TotalGames:      0,
			GamesWon:        0,
			GamesLost:       0,
			UserID:          user.ID,
		}

		err = db.Create(&userStats).Error
		if err != nil {
			c.String(http.StatusInternalServerError, "Unexpected error")
			log.Printf("Failed while creating user stats: %v", err)
			return
		}

		token, err := middleware.CreateToken(user)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to create token for user: %s", user.Email)
			log.Print(err)
			return
		}
		c.SetCookie("sess_token", token, 3600*24, "/", "", false, true)

		c.Header("Content-Type", "application/json")
		c.String(http.StatusCreated, "Cookie has been set")
	}
}
