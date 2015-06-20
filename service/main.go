package main

import (
	"github.com/Sirupsen/logrus"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/autoclean"
	"github.com/pritunl/pritunl-client-electron/service/handlers"
	"github.com/pritunl/pritunl-client-electron/service/logger"
)

const (
	Connecting   = "connecting"
	Connected    = "connected"
	Reconnecting = "reconnecting"
	Disconnected = "diconnected"
)

func main() {
	logger.Init()

	logrus.WithFields(logrus.Fields{
		"key": "value",
	}).Info("main: Starting pritunl")

	err := autoclean.CheckAndClean()
	if err != nil {
		logrus.WithFields(logrus.Fields{
			"error": err,
		}).Error("main: Failed to run check and clean")
		return
	}

	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	handlers.Register(router)
	router.Run("127.0.0.1:9770")
}
