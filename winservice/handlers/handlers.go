package handlers

import (
	"github.com/gin-gonic/gin"
)

func Register(engine *gin.Engine) {
	engine.GET("/test", testGet)
	engine.GET("/events", eventsGet)
}
