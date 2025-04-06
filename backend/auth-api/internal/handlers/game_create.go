package handlers

import (
	"errors"
	"fmt"
	"log"
	"math/rand/v2"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/endermn/Thesis/backend/auth-api/internal/middleware"
	"github.com/endermn/Thesis/backend/auth-api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Message struct {
	Type      string    `json:"type"`
	Text      string    `json:"message"`
	Move      string    `json:"move"`
	Promotion string    `json:"promotion"`
	GameType  string    `json:"gameType"`
	GameID    string    `json:"gameID"`
	Timestamp time.Time `json:"timestamp"`
}

type ActiveSession struct {
	SessionID   uint64
	GameID      uint64
	Player1ID   uint64
	Player2ID   uint64
	Player1Conn *websocket.Conn
	Player2Conn *websocket.Conn
}

type GameManager struct {
	sessions       map[uint64]*ActiveSession
	pendingSession *ActiveSession
	mutex          sync.Mutex
}

func NewGameManager(db *gorm.DB) *GameManager {
	return &GameManager{
		sessions: make(map[uint64]*ActiveSession),
	}
}

var gameManager = &GameManager{
	sessions: make(map[uint64]*ActiveSession),
}

func GameHandler(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Failed to upgrade connection: %v", err)
			return
		}

		log.Printf("Client connected: %s", conn.RemoteAddr())

		gameManager.mutex.Lock()
		defer gameManager.mutex.Unlock()

		token, err := c.Cookie("sess_token")
		if err != nil {
			log.Print(err)
			c.String(http.StatusUnauthorized, "failed to find cookie")
			c.Abort()
			return
		}

		claims, err := middleware.ExtractJWTPayload(token)
		if err != nil {
			c.String(http.StatusInternalServerError, "Unexpected error occurred")
			log.Printf("Failed to extract JWT Payload on token: %v", token)
			c.Abort()
			return
		}

		idValue, ok := claims["userID"]
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: missing user ID")
			c.Abort()
			return
		}

		userIDFloat, ok := idValue.(float64)
		if !ok {
			c.String(http.StatusUnauthorized, "Invalid token: user ID is not a number")
			c.Abort()
			return
		}

		userID := uint64(userIDFloat)
		log.Printf("Initial userID: %v", userID)
		if gameManager.pendingSession != nil {
			var game models.Game
			if err := db.First(&game, gameManager.pendingSession.GameID).Error; err != nil {
				log.Printf("Error retrieving game: %v", err)
				conn.Close()
				return
			}

			var sessionRecord models.Session
			err := db.FirstOrCreate(&sessionRecord, models.Session{
				GameID: game.ID,
			}).Error
			if err != nil {
				log.Printf("Error retrieving/creating session: %v", err)
				conn.Close()
				return
			}

			game.OpponentType = models.OpponentTypeUser
			game.OpponentUserID = userID

			if err := db.Save(&game).Error; err != nil {
				log.Printf("Error saving game: %v", err)
				conn.Close()
				return
			}

			gameManager.pendingSession.Player2ID = userID
			gameManager.pendingSession.Player2Conn = conn

			colorNum := rand.IntN(2)
			var color string
			var oppositeColor string
			if colorNum == 0 {
				color = "white"
				oppositeColor = "black"
			} else {
				color = "black"
				oppositeColor = "white"
			}

			gameManager.pendingSession.Player1Conn.WriteJSON(map[string]string{
				"type":    "game_start",
				"message": "Player 2 has joined! Game is starting.",
				"gameID":  strconv.FormatUint(game.PublicID, 10),
				"userID":  fmt.Sprintf("%v", gameManager.pendingSession.Player1ID),
				"color":   color,
			})

			gameManager.pendingSession.Player2Conn.WriteJSON(map[string]string{
				"type":    "game_start",
				"message": "You've joined a game! Game is starting.",
				"gameID":  strconv.FormatUint(game.PublicID, 10),
				"userID":  fmt.Sprintf("%v", gameManager.pendingSession.Player2ID),
				"color":   oppositeColor,
			})

			gameManager.sessions[sessionRecord.ID] = gameManager.pendingSession

			gameManager.pendingSession = nil

			go handleGameCommunication(db, conn, game.ID, sessionRecord.ID, userID)
		} else {
			newGame := models.Game{
				UserID:       userID,
				OpponentType: models.OpponentTypeUser,
				GameStatus:   models.GameStatusInProgress,
				GameState:    models.GameStateDraw,
				GamePoints:   10,
			}

			if err := db.Create(&newGame).Error; err != nil {
				log.Printf("Error creating game: %v", err)
				conn.Close()
				return
			}

			newGame.PublicID = newGame.ID
			if err := db.Save(&newGame).Error; err != nil {
				log.Printf("Error updating game public ID: %v", err)
				conn.Close()
				return
			}

			newSessionRecord := models.Session{
				GameID: newGame.ID,
			}

			if err := db.Create(&newSessionRecord).Error; err != nil {
				log.Printf("Error creating session record: %v", err)
				conn.Close()
				return
			}

			newActiveSession := &ActiveSession{
				SessionID:   newSessionRecord.ID,
				GameID:      newGame.ID,
				Player1ID:   userID,
				Player1Conn: conn,
			}

			gameManager.pendingSession = newActiveSession

			log.Printf("Created new game session: %d", newGame.ID)

			conn.WriteJSON(map[string]string{
				"type":    "waiting",
				"message": "Waiting for another player to join...",
				"gameID":  strconv.FormatUint(newGame.PublicID, 10),
			})

			go handleGameCommunication(db, conn, newGame.ID, newSessionRecord.ID, userID)
		}
	}
}

func handleGameCommunication(db *gorm.DB, conn *websocket.Conn, gameID uint64, sessionID uint64, userID uint64) {
	defer func() {
		conn.Close()
		handlePlayerDisconnect(db, conn, sessionID, userID)
	}()

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("Failed to read message: %v", err)
			return
		}
		log.Printf("Received message from session %d, user %d: %s", sessionID, userID, msg.Text)
		if msg.Type == "cancel" {
			delete(gameManager.sessions, sessionID)
		}

		switch msg.Type {
		case "mate":
			var game models.Game
			result := db.First(&game, gameID)
			if result.Error != nil {
				if errors.Is(result.Error, gorm.ErrRecordNotFound) {
					log.Printf("Game not found!")
					return
				}
				log.Printf("Failed to get game: %v", err)
				return
			}
			if msg.Text == "White" {
				game.GameState = models.GameStateWin
			} else {
				game.GameState = models.GameStateFailure
			}
			game.GameStatus = models.GameStatusFinished

			if err := db.Save(&game).Error; err != nil {
				log.Printf("Failed while saving game: %v", err)
				return
			}

			var stats models.Statistic
			result = db.Where("user_id = ?", game.UserID).First(&stats)
			if result.Error != nil {
				if result.Error == gorm.ErrRecordNotFound {
					stats = models.Statistic{
						UserID: game.UserID,
					}
				} else {
					log.Printf("Failed to retrieve user stats: %v", result.Error)
					return
				}
			}

			stats.TotalGames++
			userWin := game.GameState == models.GameStateWin
			userMult := 0
			if userWin {
				userMult = 1
				stats.GamesWon++
			} else {
				userMult = -1
				stats.GamesLost++
			}

			switch msg.GameType {
			case "bullet":
				stats.BulletRating += game.GamePoints * userMult
			case "blitz":
				stats.BlitzRating += game.GamePoints * userMult
			case "rapid":
				stats.RapidRating += game.GamePoints * userMult
			case "classical":
				stats.ClassicalRating += game.GamePoints * userMult
			}

			log.Printf("User stats: %v", stats)

			if err := db.Save(&stats).Error; err != nil {
				log.Printf("Failed to update user stats: %v", err)
				return
			}

			// Update the opponent's statistics
			var oppStats models.Statistic
			oppResult := db.Where("user_id = ?", game.OpponentUserID).First(&oppStats)
			if oppResult.Error != nil {
				if oppResult.Error == gorm.ErrRecordNotFound {
					oppStats = models.Statistic{
						UserID: game.OpponentUserID,
					}
				} else {
					log.Printf("Failed to retrieve opponent stats: %v", oppResult.Error)
					return
				}
			}

			// Update opponent stats
			oppStats.TotalGames++
			oppWin := game.GameState != models.GameStateWin // Opponent wins when player loses
			oppMult := 0
			if oppWin {
				oppMult = 1
				oppStats.GamesWon++
			} else {
				oppMult = -1
				oppStats.GamesLost++
			}

			switch msg.GameType {
			case "bullet":
				oppStats.BulletRating += game.GamePoints * oppMult
			case "blitz":
				oppStats.BlitzRating += game.GamePoints * oppMult
			case "rapid":
				oppStats.RapidRating += game.GamePoints * oppMult
			case "classical":
				oppStats.ClassicalRating += game.GamePoints * oppMult
			}

			log.Printf("Opponent stats: %v", oppStats)

			if err := db.Save(&oppStats).Error; err != nil {
				log.Printf("Failed to update opponent stats: %v", err)
				return
			}

			delete(gameManager.sessions, sessionID)
		case "move":
			gameManager.mutex.Lock()
			session, exists := gameManager.sessions[sessionID]
			if !exists {
				gameManager.mutex.Unlock()
				log.Printf("Session %d not found", sessionID)
				return
			}

			if session.Player1ID == userID {
				if session.Player2Conn != nil {
					if err := session.Player2Conn.WriteJSON(msg); err != nil {
						log.Printf("Error writing message to player 2: %v", err)
					}
				}
			} else if session.Player2ID == userID {
				if session.Player1Conn != nil {
					if err := session.Player1Conn.WriteJSON(msg); err != nil {
						log.Printf("Error writing message to player 1: %v", err)
					}
				}
			}
			gameManager.mutex.Unlock()
		default:
			if err := conn.WriteJSON(msg); err != nil {
				log.Printf("Error writing message: %v", err)
				return
			}
		}
	}
}

func handlePlayerDisconnect(db *gorm.DB, conn *websocket.Conn, sessionID uint64, userID uint64) {
	gameManager.mutex.Lock()
	defer gameManager.mutex.Unlock()

	if gameManager.pendingSession != nil &&
		(gameManager.pendingSession.Player1Conn == conn || gameManager.pendingSession.Player2Conn == conn) {
		var game models.Game
		if err := db.First(&game, gameManager.pendingSession.GameID).Error; err == nil {
			game.GameStatus = models.GameStatusFinished
			db.Save(&game)
		}

		gameManager.pendingSession = nil
		return
	}

	session, exists := gameManager.sessions[sessionID]
	if !exists {
		return
	}

	if session.Player1ID == userID && session.Player2Conn != nil {
		session.Player2Conn.WriteJSON(map[string]string{
			"type":    "opponent_disconnected",
			"message": "Your opponent has disconnected.",
		})
	} else if session.Player2ID == userID && session.Player1Conn != nil {
		session.Player1Conn.WriteJSON(map[string]string{
			"type":    "opponent_disconnected",
			"message": "Your opponent has disconnected.",
		})
	}

	var game models.Game
	if err := db.First(&game, session.GameID).Error; err == nil {
		game.GameStatus = models.GameStatusFinished
		db.Save(&game)
	}

	delete(gameManager.sessions, sessionID)
}
