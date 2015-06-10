package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

func testGet(c *gin.Context) {
	adapAvial, adapTotal, err := utils.UpdateAdapters()
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	c.String(200, fmt.Sprintf("%d/%d", adapAvial, adapTotal))
}
