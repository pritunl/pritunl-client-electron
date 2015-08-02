package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"time"
)

func wakeupGet(c *gin.Context) {
	evt := &event.Event{
		Id:   utils.Uuid(),
		Type: "wakeup",
	}
	evt.Init()

	for i := 0; i < 8; i++ {
		time.Sleep(50 * time.Millisecond)
		if time.Since(event.LastAwake) < 200*time.Millisecond {
			c.String(200, "")
			return
		}
	}

	c.String(404, "")
}
