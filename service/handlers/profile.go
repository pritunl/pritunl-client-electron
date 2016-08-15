package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/profile"
)

type profileData struct {
	Id       string `json:"id"`
	Data     string `json:"data"`
	Username string `json:"username"`
	Password string `json:"password"`
	Timeout  bool   `json:"timeout"`
}

func profileGet(c *gin.Context) {
	c.JSON(200, profile.GetProfiles())
}

func profilePost(c *gin.Context) {
	data := &profileData{}
	c.Bind(data)

	prfl := &profile.Profile{
		Id:       data.Id,
		Data:     data.Data,
		Username: data.Username,
		Password: data.Password,
	}
	prfl.Init()

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

	prfl := profile.GetProfile(data.Id)
	if prfl != nil {
		err := prfl.Stop()
		if err != nil {
			c.AbortWithError(500, err)
			return
		}
	}

	c.JSON(200, nil)
}
