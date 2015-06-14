package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/profile"
)

func startPost(c *gin.Context) {
	id := c.PostForm("id")
	data := c.PostForm("data")

	go func() {
		prfl := &profile.Profile{
			Id:   id,
			Data: data,
		}

		err := prfl.Start()
		if err != nil {
			// TODO
			panic(err)
		}
	}()

	c.JSON(200, nil)
}
