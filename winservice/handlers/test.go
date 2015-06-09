package handlers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/winservice/utils"
)

func testGet(c *gin.Context) {
	output, err := utils.UpdateAdapters()
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	c.String(200, fmt.Sprintf("%s", output))
}
