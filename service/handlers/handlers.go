package handlers

import (
	"github.com/gin-gonic/gin"
)

func Register(engine *gin.Engine) {
	engine.GET("/events", eventsGet)
	engine.GET("/profile", profileGet)
	engine.POST("/profile", profilePost)
	engine.DELETE("/profile", profileDel)
	engine.POST("/stop", stopPost)
	engine.GET("/status", statusGet)
}
