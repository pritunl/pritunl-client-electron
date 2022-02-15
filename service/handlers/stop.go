package handlers

import (
	"github.com/dhurley94/pritunl-client-electron/service/autoclean"
	"github.com/dhurley94/pritunl-client-electron/service/profile"
	"github.com/gin-gonic/gin"
)

func stopPost(c *gin.Context) {
	prfls := profile.GetProfiles()
	for _, prfl := range prfls {
		prfl.Stop()
	}

	autoclean.CheckAndCleanWatch()

	c.JSON(200, nil)
}
