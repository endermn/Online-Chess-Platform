package handlers

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func WebsocketHandler(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Upgrade error: %v", err)
		return
	}
	defer conn.Close()

	log.Printf("Client connected: %s", conn.RemoteAddr())

	token := c.Query("token")
	authHeader := c.GetHeader("Authorization")

	if token != "secret-token" && authHeader != "Bearer secret-token" {
		log.Printf("Authentication failed for %s", conn.RemoteAddr())
		conn.WriteMessage(websocket.TextMessage, []byte("Authentication failed"))
		conn.Close()
		return
	}

	log.Printf("Client authenticated: %s", conn.RemoteAddr())
	conn.WriteMessage(websocket.TextMessage, []byte("Authentication successful"))

	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Read error: %v", err)
			break
		}
		log.Printf("Received: %s", message)

		// Echo the message back
		if err := conn.WriteMessage(messageType, message); err != nil {
			log.Printf("Write error: %v", err)
			break
		}
	}
}
