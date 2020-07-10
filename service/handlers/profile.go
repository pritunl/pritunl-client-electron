package handlers

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

type profileData struct {
	Id                 string `json:"id"`
	Mode               string `json:"mode"`
	PortWg             int    `json:"port_wg"`
	OrgId              string `json:"org_id"`
	UserId             string `json:"user_id"`
	ServerId           string `json:"server_id"`
	SyncToken          string `json:"sync_token"`
	SyncSecret         string `json:"sync_secret"`
	Data               string `json:"data"`
	Username           string `json:"username"`
	Password           string `json:"password"`
	ServerPublicKey    string `json:"server_public_key"`
	ServerBoxPublicKey string `json:"server_box_public_key"`
	TokenTtl           int    `json:"token_ttl"`
	Reconnect          bool   `json:"reconnect"`
	Timeout            bool   `json:"timeout"`
}

func profileGet(c *gin.Context) {
	c.JSON(200, profile.GetProfiles())
}

func profilePost(c *gin.Context) {
	data := &profileData{}

	err := c.Bind(data)
	if err != nil {
		err = &errortypes.ParseError{
			errors.Wrap(err, "handler: Bind error"),
		}
		utils.AbortWithError(c, 400, err)
		return
	}
	data.Id = utils.FilterStr(data.Id)

	prfl := profile.GetProfile(data.Id)
	if prfl != nil {
		err := prfl.Stop()
		if err != nil {
			utils.AbortWithError(c, 500, err)
			return
		}
	}

	prfl = &profile.Profile{
		Id:                 data.Id,
		Mode:               data.Mode,
		PortWg:             data.PortWg,
		OrgId:              data.OrgId,
		UserId:             data.UserId,
		ServerId:           data.ServerId,
		SyncToken:          data.SyncToken,
		SyncSecret:         data.SyncSecret,
		Data:               data.Data,
		Username:           data.Username,
		Password:           data.Password,
		ServerPublicKey:    data.ServerPublicKey,
		ServerBoxPublicKey: data.ServerBoxPublicKey,
		TokenTtl:           data.TokenTtl,
		Reconnect:          data.Reconnect,
	}
	prfl.Init()

	err = prfl.Start(data.Timeout)
	if err != nil {
		err = &errortypes.ParseError{
			errors.Wrap(err, "handler: Bind error"),
		}
		utils.AbortWithError(c, 500, err)
		return
	}

	c.JSON(200, nil)
}

func profileDel(c *gin.Context) {
	data := &profileData{}

	err := c.Bind(data)
	if err != nil {
		utils.AbortWithError(c, 400, err)
		return
	}
	data.Id = utils.FilterStr(data.Id)

	prfl := profile.GetProfile(data.Id)
	if prfl != nil {
		err := prfl.Stop()
		if err != nil {
			utils.AbortWithError(c, 500, err)
			return
		}
	}

	c.JSON(200, nil)
}
