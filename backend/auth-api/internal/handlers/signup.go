package handlers

import "github.com/gin-gonic/gin"

type SignupParams struct {
	FullName string `json:"fullname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func SignupHandler(c *gin.Context) {
	var params SignupParams
	c.BindJSON(&params)

	c.Header("Content-Type", "application/json")
	c.JSON(200, struct{}{})
}
