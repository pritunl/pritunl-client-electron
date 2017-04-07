package main

import (
	"github.com/Sirupsen/logrus"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/auth"
	"github.com/pritunl/pritunl-client-electron/service/autoclean"
	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/handlers"
	"github.com/pritunl/pritunl-client-electron/service/logger"
	"github.com/pritunl/pritunl-client-electron/service/watch"
	"runtime/debug"
)

func main() {
	logger.Init()

	logrus.WithFields(logrus.Fields{
		"version": constants.Version,
	}).Info("main: Service starting")

	defer func() {
		panc := recover()
		if panc != nil {
			logrus.WithFields(logrus.Fields{
				"stack": string(debug.Stack()),
				"panic": panc,
			}).Error("main: Panic")
			panic(panc)
		}
	}()

	err := auth.Init()
	if err != nil {
		logrus.WithFields(logrus.Fields{
			"error": err,
		}).Error("main: Failed to init auth")
		panic(err)
	}

	err = autoclean.CheckAndClean()
	if err != nil {
		logrus.WithFields(logrus.Fields{
			"error": err,
		}).Error("main: Failed to run check and clean")
		panic(err)
	}

	gin.SetMode(gin.ReleaseMode)

	router := gin.New()
	handlers.Register(router)

	watch.StartWatch()

	err = router.Run("127.0.0.1:9770")
	if err != nil {
		logrus.WithFields(logrus.Fields{
			"error": err,
		}).Error("main: Server error")
		panic(err)
	}
}
