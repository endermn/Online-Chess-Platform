package handlers

import (
	"net/http"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func NewsHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var allNews []models.News

		result := db.Find(&allNews)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to fetch news: " + result.Error.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, allNews)
	}
}
