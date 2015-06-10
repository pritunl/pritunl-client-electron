package main

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/handlers"
)

const (
	Connecting   = "connecting"
	Connected    = "connected"
	Reconnecting = "reconnecting"
	Disconnected = "diconnected"
)

func main() {
	router := gin.Default()

	handlers.Register(router)

	router.Run("127.0.0.1:9771")
}
