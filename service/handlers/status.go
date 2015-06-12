package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/profile"
)

func statusGet(c *gin.Context) {
	c.JSON(200, profile.Profiles)
}
