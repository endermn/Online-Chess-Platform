package handlers

import (
	"log"
	"net/http"

	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RandomPuzzleResponse struct {
	ID         string `json:"id"`
	FEN        string `json:"fen"`
	FirstMove  string `json:"first_move"`
	SecondMove string `json:"second_move"`
	Rating     int    `json:"rating"`
}

func GetRandomPuzzle(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var puzzle models.Puzzle

		result := db.Raw(`
			SELECT puzzle_id, fen, first_move, second_move
			FROM puzzles 
			ORDER BY RANDOM() 
			LIMIT 1
		`).Scan(&puzzle)

		if result.Error != nil {
			c.String(http.StatusInternalServerError, "Unexpected Error")
			log.Printf("%v", result.Error)
			return
		}

		if puzzle.PuzzleId == "" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "No puzzles found in the database",
			})
			return
		}

		response := RandomPuzzleResponse{
			ID:         puzzle.PuzzleId,
			FEN:        puzzle.FEN,
			Rating:     int(puzzle.Rating),
			FirstMove:  puzzle.FirstMove,
			SecondMove: puzzle.SecondMove,
		}

		log.Printf("moves: %v ", puzzle.SecondMove)
		log.Printf("fen: %v ", puzzle.FEN)

		c.JSON(http.StatusOK, response)
	}
}
