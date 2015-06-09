package main

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
	"os/exec"
	"time"
)

type Event struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

const (
	Connecting   = "connecting"
	Connected    = "connected"
	Reconnecting = "reconnecting"
	Disconnected = "diconnected"
	writeTimeout = 10 * time.Second
	pingInterval = 30 * time.Second
	pingWait     = 40 * time.Second
)

var (
	events   = make(chan *Event)
	upgrader = websocket.Upgrader{
		HandshakeTimeout: 30 * time.Second,
		ReadBufferSize:   1024,
		WriteBufferSize:  1024,
		CheckOrigin: func(_ *http.Request) bool {
			return true
		},
	}
)

func commGet(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.Fail(500, err)
		return
	}

	conn.SetReadDeadline(time.Now().Add(pingWait))
	conn.SetPongHandler(func(x string) (err error) {
		conn.SetReadDeadline(time.Now().Add(pingWait))
		return
	})

	ticker := time.NewTicker(pingInterval)

	defer func() {
		ticker.Stop()
		conn.Close()
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
		case evt, ok := <-events:
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

type CommandError struct {
	errors.DropboxError
}

func updateAdapters() (output []byte, err error) {
	output, err = exec.Command("ipconfig", "/all").Output()
	if err != nil {
		err = &CommandError{
			errors.Wrap(err, "Update tuntap adapters failed"),
		}
		return
	}

	return
}

func main() {
	router := gin.Default()

	router.GET("/comm", commGet)

	router.Run("127.0.0.1:9770")
}
