package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"time"
)

func wakeupPost(c *gin.Context) {
	evt := &event.Event{
		Id:   utils.Uuid(),
		Type: "wakeup",
	}
	evt.Init()

	for i := 0; i < 50; i++ {
		time.Sleep(5 * time.Millisecond)
		if time.Since(event.LastAwake) < 200*time.Millisecond {
			c.String(200, "")
			return
		}
	}

	c.String(404, "")
}
