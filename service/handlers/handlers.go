package handlers

import (
	"github.com/gin-gonic/gin"
)

func Register(engine *gin.Engine) {
	engine.GET("/events", eventsGet)

	engine.GET("/test", testGet)
	engine.GET("/test2", test2Get)
}
