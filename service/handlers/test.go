package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"time"
)

func test2Get(c *gin.Context) {
	evt := &event.Event{
		Type: "ping",
		Data: time.Now().Unix(),
	}
	evt.Init()
}

func testGet(c *gin.Context) {
	adapAvial, adapTotal, err := utils.UpdateAdapters()
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	c.String(200, fmt.Sprintf("%d/%d", adapAvial, adapTotal))
}
