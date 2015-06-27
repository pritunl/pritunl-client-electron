// Api handlers.
package handlers

import (
	"fmt"
	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"github.com/gin-gonic/gin"
	"net/http"
)

// Recover panics
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

// Log errors
func Errors(c *gin.Context) {
	c.Next()
	for _, err := range c.Errors {
		logrus.WithFields(logrus.Fields{
			"error": errors.New(fmt.Sprintf("%s", err)),
		}).Error("handlers: Handler error")
	}
}

func Register(engine *gin.Engine) {
	engine.Use(Recovery)
	engine.Use(Errors)

	engine.GET("/events", eventsGet)
	engine.GET("/profile", profileGet)
	engine.POST("/profile", profilePost)
	engine.DELETE("/profile", profileDel)
	engine.GET("/ping", pingGet)
	engine.POST("/stop", stopPost)
	engine.GET("/status", statusGet)
}
