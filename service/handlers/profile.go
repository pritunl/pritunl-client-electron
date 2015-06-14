package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/profile"
)

type profileData struct {
	Id      string `json:"id"`
	Data    string `json:"data"`
	Timeout bool   `json:"timeout"`
}

func profileGet(c *gin.Context) {
	c.JSON(200, profile.Profiles)
}

func profilePost(c *gin.Context) {
	data := &profileData{}
	c.Bind(data)

	prfl := &profile.Profile{
		Id:   data.Id,
		Data: data.Data,
	}

	err := prfl.Start(data.Timeout)
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	c.JSON(200, nil)
}

func profileDel(c *gin.Context) {
	data := &profileData{}
	c.Bind(data)

	if prfl, ok := profile.Profiles[data.Id]; ok {
		err := prfl.Stop()
		if err != nil {
			c.AbortWithError(500, err)
			return
		}
	}

	c.JSON(200, nil)
}
