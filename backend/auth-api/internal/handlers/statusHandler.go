package handlers

import "github.com/gin-gonic/gin"

type ConnectionStatus struct {
	Server bool `json:"server"`
}

func StatusHandler(c *gin.Context) {
	c.Header("Content-Type", "application/json")
	status := ConnectionStatus{
		Server: true,
	}
	c.JSON(200, status)
}
