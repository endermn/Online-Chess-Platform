package handlers

import (
	"log"
	"net/http"
	"strconv"
	"sync"

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

type ActiveSession struct {
	SessionID   uint64
	GameID      uint64
	Player1ID   uint64
	Player2ID   uint64
	Player1Conn *websocket.Conn
	Player2Conn *websocket.Conn
}

type GameManager struct {
	sessions       map[uint64]*ActiveSession // Map of sessionID to ActiveSession
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

		err = middleware.VerifyToken(token)
		if err != nil {
			c.String(http.StatusUnauthorized, "Invalid token: %v", err)
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

		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Failed to upgrade connection: %v", err)
			return
		}

		log.Printf("Client connected: %s", conn.RemoteAddr())

		gameManager.mutex.Lock()
		defer gameManager.mutex.Unlock()

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

			gameManager.pendingSession.Player1Conn.WriteJSON(map[string]string{
				"type":    "game_start",
				"message": "Player 2 has joined! Game is starting.",
				"gameID":  strconv.FormatUint(game.PublicID, 10),
			})

			gameManager.pendingSession.Player2Conn.WriteJSON(map[string]string{
				"type":    "game_start",
				"message": "You've joined a game! Game is starting.",
				"gameID":  strconv.FormatUint(game.PublicID, 10),
			})

			gameManager.sessions[sessionRecord.ID] = gameManager.pendingSession

			gameManager.pendingSession = nil

			go handleGameCommunication(db, conn, sessionRecord.ID, userID)
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

			go handleGameCommunication(db, conn, newSessionRecord.ID, userID)
		}
	}
}

func handleGameCommunication(db *gorm.DB, conn *websocket.Conn, sessionID uint64, userID uint64) {
	defer func() {
		conn.Close()
		handlePlayerDisconnect(db, conn, sessionID, userID)
	}()

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}

		log.Printf("Received message from session %d, user %d: %s", sessionID, userID, message)

		// For now, just echo the message back
		if err := conn.WriteMessage(messageType, message); err != nil {
			log.Printf("Error writing message: %v", err)
			break
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
