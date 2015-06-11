package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/pritunl/pritunl-client-electron/service/event"
	"net/http"
	"time"
)

const (
	writeTimeout = 10 * time.Second
	pingInterval = 30 * time.Second
	pingWait     = 40 * time.Second
)

var (
	upgrader = websocket.Upgrader{
		HandshakeTimeout: 30 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
		CheckOrigin: func(_ *http.Request) bool {
			return true
		},
	}
)

func eventsGet(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	conn.SetReadDeadline(time.Now().Add(pingWait))
	conn.SetPongHandler(func(x string) (err error) {
		conn.SetReadDeadline(time.Now().Add(pingWait))
		return
	})

	list := event.NewListener()

	ticker := time.NewTicker(pingInterval)

	defer func() {
		ticker.Stop()
		conn.Close()
		list.Close()
	}()

	go func() {
		for {
			if _, _, err := conn.NextReader(); err != nil {
				conn.Close()
				break
			}
		}
	}()

	for {
		select {
		case evt, ok := <-list.Listen():
			if !ok {
				conn.WriteControl(websocket.CloseMessage, []byte{},
					time.Now().Add(writeTimeout))
				return
			}

			conn.SetWriteDeadline(time.Now().Add(writeTimeout))
			err = conn.WriteJSON(evt)
			if err != nil {
				return
			}
		case <-ticker.C:
			err = conn.WriteControl(websocket.PingMessage, []byte{},
				time.Now().Add(writeTimeout))
			if err != nil {
				return
			}
		}
	}
}
