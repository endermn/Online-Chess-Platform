package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AdminAuthMiddleware checks if a user is an admin
func AdminAuthMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract token from cookie
		token, err := c.Cookie("sess_token")
		if err != nil {
			c.String(http.StatusUnauthorized, "failed to find cookie")
			c.Abort()
			return
		}

		// Extract claims from JWT
		claims, err := middleware.ExtractJWTPayload(token)
		if err != nil {
			c.String(http.StatusInternalServerError, "Unexpected error occurred")
			log.Printf("Failed to extract JWT Payload on token: %v", token)
			c.Abort()
			return
		}

		// Get user ID from claims
		idValue, ok := claims["userID"]
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: missing user ID")
			c.Abort()
			return
		}

		// Convert ID to float64 (JSON numbers are represented as float64)
		userIDFloat, ok := idValue.(float64)
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: user ID is not a number")
			c.Abort()
			return
		}

		// Convert float64 to uint64
		userID := uint64(userIDFloat)

		// Store userID in context for later use
		c.Set("userID", userID)

		log.Printf("User ID from JWT: %v", userID)

		// Find the user in the database
		var user models.User
		if err := db.First(&user, userID).Error; err != nil {
			log.Printf("Error finding user: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// Check if user is an admin and active
		if !user.IsAdmin || !user.IsActive {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied: Admin privileges required"})
			c.Abort()
			return
		}

		// User is an admin, continue
		c.Next()
	}
}

// DeleteUser handles the deletion of users
func DeleteUser(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get user ID from URL parameter
		userIDParam := c.Param("id")

		if userIDParam == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
			return
		}

		// Convert the ID to uint64
		userID, err := strconv.ParseUint(userIDParam, 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
			return
		}

		log.Printf("Attempting to delete user with ID: %d", userID)

		// Attempt to delete the user
		result := db.Delete(&models.User{}, userID)
		if result.Error != nil {
			log.Printf("Failed to delete user: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user", "details": result.Error.Error()})
			return
		}

		if result.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
	}
}

// GetUsers lists all users - for admin viewing
func GetUsers(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var users []models.User
		if err := db.Find(&users).Error; err != nil {
			log.Printf("Failed to fetch users: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
			return
		}

		log.Printf("Retrieved %d users", len(users))

		// Sanitize user data (remove password hashes)
		var sanitizedUsers []gin.H
		for _, user := range users {
			sanitizedUsers = append(sanitizedUsers, gin.H{
				"id":              user.ID,
				"publicID":        user.PublicID,
				"fullName":        user.FullName,
				"email":           user.Email,
				"isActive":        user.IsActive,
				"isAdmin":         user.IsAdmin,
				"createdAt":       user.CreatedAt,
				"lastLogin":       user.LastLogin,
				"pictureFileName": user.PictureFileName,
			})
		}

		c.JSON(http.StatusOK, sanitizedUsers)
	}
}
