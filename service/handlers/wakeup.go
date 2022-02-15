package handlers

import (
	"time"

	"github.com/dhurley94/pritunl-client-electron/service/event"
	"github.com/dhurley94/pritunl-client-electron/service/utils"
	"github.com/gin-gonic/gin"
)

func wakeupPost(c *gin.Context) {
	evt := &event.Event{
		Id:   utils.Uuid(),
		Type: "wakeup",
	}
	evt.Init()

	for i := 0; i < 50; i++ {
		time.Sleep(5 * time.Millisecond)
		if utils.SinceSafe(event.LastAwake) < 200*time.Millisecond {
			c.String(200, "")
			return
		}
	}

	c.String(404, "")
}
