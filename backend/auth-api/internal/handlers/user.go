package handlers

import (
	"log"
	"net/http"

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
	if err := db.Where("user_id = ?", userID).
		Order("id DESC").
		Limit(limit).
		Find(&games).Error; err != nil {
		return nil, err
	}

	results := make([]GameResult, len(games))
	for i, game := range games {
		result := GameResult{
			Game:   game,
			Points: game.GamePoints,
		}

		switch game.GameState {
		case models.GameStateWin:
			result.IsWin = true
		case models.GameStateFailure:
			result.IsLoss = true
		case models.GameStateDraw:
			result.IsDraw = true
		}

		if game.OpponentType == models.OpponentTypeBot {
			result.Opponent = "Bot"
		} else if game.OpponentType == models.OpponentTypeUser && game.OpponentUserID > 0 {
			result.Opponent = "User"
		}

		results[i] = result
	}

	return results, nil
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
		log.Printf("Handler user stats: %v", user_stats)

		c.JSON(http.StatusOK, user_stats)
	}
}
