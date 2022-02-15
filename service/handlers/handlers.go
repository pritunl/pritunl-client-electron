package handlers

import (
	"crypto/subtle"
	"fmt"
	"net/http"

	"github.com/dhurley94/pritunl-client-electron/service/auth"
	"github.com/dropbox/godropbox/errors"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func Recovery(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			logrus.WithFields(logrus.Fields{
				"error": errors.New(fmt.Sprintf("%s", r)),
			}).Error("handlers: Handler panic")
			c.Writer.WriteHeader(http.StatusInternalServerError)
		}
	}()

	c.Next()
}

func Errors(c *gin.Context) {
	c.Next()
	for _, err := range c.Errors {
		logrus.WithFields(logrus.Fields{
			"error": err,
		}).Error("handlers: Handler error")
	}
}

func Auth(c *gin.Context) {
	token := c.Request.Header.Get("Auth-Token")
	if token == "" {
		token = c.Request.Header.Get("Auth-Key")
	}
	if token == "" {
		token = c.Query("token")
	}

	if c.Request.Header.Get("Origin") != "" ||
		c.Request.Header.Get("Referer") != "" ||
		c.Request.Header.Get("User-Agent") != "pritunl" ||
		subtle.ConstantTimeCompare([]byte(token), []byte(auth.Key)) != 1 {

		c.AbortWithStatus(401)
		return
	}
	c.Next()
}

func Register(engine *gin.Engine) {
	engine.Use(Auth)
	engine.Use(Recovery)
	engine.Use(Errors)

	engine.GET("/events", eventsGet)
	engine.GET("/profile", profileGet)
	engine.POST("/profile", profilePost)
	engine.DELETE("/profile", profileDel)
	engine.GET("/sprofile", sprofilesGet)
	engine.PUT("/sprofile", sprofilePut)
	engine.DELETE("/sprofile", sprofileDel)
	engine.GET("/sprofile/:profile_id/log", sprofileLogGet)
	engine.DELETE("/sprofile/:profile_id/log", sprofileLogDel)
	engine.PUT("/token", tokenPut)
	engine.DELETE("/token", tokenDelete)
	engine.GET("/ping", pingGet)
	engine.POST("/stop", stopPost)
	engine.POST("/restart", restartPost)
	engine.GET("/status", statusGet)
	engine.GET("/state", stateGet)
	engine.POST("/wakeup", wakeupPost)
}
