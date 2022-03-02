package handlers

import (
	"github.com/dhurley94/pritunl-client-electron/service/profile"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func restartPost(c *gin.Context) {
	logrus.Warn("handlers: Restarting...")

	profile.RestartProfiles(false)

	c.JSON(200, nil)
}
