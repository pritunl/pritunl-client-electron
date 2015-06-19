package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/profile"
)

func stopPost(c *gin.Context) {
	for _, prfl := range profile.Profiles {
		prfl.Stop()
	}

	c.JSON(200, nil)
}
