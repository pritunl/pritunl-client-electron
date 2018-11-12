package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/token"
)

type tokenData struct {
	Profile         string `json:"profile"`
	ServerPublicKey string `json:"server_public_key"`
	Ttl             int    `json:"ttl"`
}

func tokenPut(c *gin.Context) {
	data := &tokenData{}
	c.Bind(data)

	tokn, err := token.Update(data.Profile, data.ServerPublicKey, data.Ttl)
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	c.JSON(200, tokn)
}

func tokenDelete(c *gin.Context) {
	data := &tokenData{}
	c.Bind(data)

	token.Clear(data.Profile)

	c.JSON(200, nil)
}
