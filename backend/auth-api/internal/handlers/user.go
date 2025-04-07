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

type GameResult struct {
	Game     models.Game
	IsWin    bool
	IsLoss   bool
	IsDraw   bool
	Opponent string
	Points   int
}

func GetRecentGamesForUser(db *gorm.DB, userID uint64, limit int) ([]GameResult, error) {
	if limit <= 0 {
		limit = 10
	}

	var games []models.Game
	if err := db.Where("user_id = ? OR opponent_user_id = ?",
		userID, userID).
		Order("id DESC").
		Limit(limit).
		Find(&games).Error; err != nil {
		return nil, err
	}

	results := make([]GameResult, len(games))
	for i, game := range games {
		result := GameResult{
			Game:     game,
			Opponent: game.OpponentType,
			Points:   game.GamePoints,
		}

		isOpponent := game.OpponentUserID == userID

		if isOpponent {
			switch game.GameState {
			case models.GameStateWin:
				result.IsLoss = true
			case models.GameStateFailure:
				result.IsWin = true
			case models.GameStateDraw:
				result.IsDraw = true
			}
		} else {
			switch game.GameState {
			case models.GameStateWin:
				result.IsWin = true
			case models.GameStateFailure:
				result.IsLoss = true
			case models.GameStateDraw:
				result.IsDraw = true
			}
		}

		results[i] = result
	}

	return results, nil
}

func UserRecentGamesHandler(db *gorm.DB) gin.HandlerFunc {
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

		idValue, ok := claims["userID"]
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: missing user ID")
			return
		}

		user_id_float, ok := idValue.(float64)
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: user ID is not a number")
			return
		}

		user_id := uint64(user_id_float)

		// Get limit from query parameter, default to 10
		limit := 10
		limitParam := c.Query("limit")
		if limitParam != "" {
			if parsedLimit, err := strconv.Atoi(limitParam); err == nil && parsedLimit > 0 {
				limit = parsedLimit
			}
		}

		// Call the GetRecentGamesForUser function
		recentGames, err := GetRecentGamesForUser(db, user_id, limit)
		if err != nil {
			c.String(http.StatusInternalServerError, "Failed to fetch recent games")
			log.Printf("Failed to fetch recent games: %v", err)
			return
		}

		// Return the results as JSON
		c.JSON(http.StatusOK, recentGames)
	}
}

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

		idValue, ok := claims["userID"]
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: missing user ID")
			return
		}
		user_id_float, ok := idValue.(float64)
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: user ID is not a string")
			return
		}

		user_id := uint64(user_id_float)
		log.Printf("Float id: %v, Uint id: %v", user_id_float, user_id)

		var user_stats models.Statistic

		err = db.Take(&user_stats, "user_id = ?", user_id).Error
		if err != nil {
			c.String(http.StatusInternalServerError, "Unexpected error occured")
			return
		}
		log.Printf("Handler user stats: %v", user_stats)

		c.JSON(http.StatusOK, user_stats)
	}
}
