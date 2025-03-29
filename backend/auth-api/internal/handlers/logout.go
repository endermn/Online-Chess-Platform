package handlers

import (
	"github.com/gin-gonic/gin"
)

func LogoutHandler(c *gin.Context) {
	c.SetCookie("sess_token", "", -1, "/", "", false, true)
	// c.Redirect(http.StatusSeeOther, "/login")
}
