package handlers

import "github.com/gin-gonic/gin"

func UserHandler(c *gin.Context) {

	c.Header("Content-Type", "application/json")
	c.JSON(200, struct{}{})
}
