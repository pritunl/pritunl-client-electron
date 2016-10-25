package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/autoclean"
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

func stopPost(c *gin.Context) {
	prfls := profile.GetProfiles()
	for _, prfl := range prfls {
		prfl.Stop(false)
	}
	for _, prfl := range prfls {
		prfl.Wait()
	}
	if len(prfls) {
		utils.ResetNetworking()
	}

	autoclean.CheckAndCleanWatch()

	c.JSON(200, nil)
}
