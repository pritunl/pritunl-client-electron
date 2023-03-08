package handlers

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/sprofile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

type profileData struct {
	Id                 string   `json:"id"`
	Mode               string   `json:"mode"`
	OrgId              string   `json:"org_id"`
	UserId             string   `json:"user_id"`
	ServerId           string   `json:"server_id"`
	SyncHosts          []string `json:"sync_hosts"`
	SyncToken          string   `json:"sync_token"`
	SyncSecret         string   `json:"sync_secret"`
	Data               string   `json:"data"`
	Username           string   `json:"username"`
	Password           string   `json:"password"`
	DynamicFirewall    bool     `json:"dynamic_firewall"`
	DisableGateway     bool     `json:"disable_gateway"`
	ForceDns           bool     `json:"force_dns"`
	SsoAuth            bool     `json:"sso_auth"`
	ServerPublicKey    string   `json:"server_public_key"`
	ServerBoxPublicKey string   `json:"server_box_public_key"`
	TokenTtl           int      `json:"token_ttl"`
	Reconnect          bool     `json:"reconnect"`
	Timeout            bool     `json:"timeout"`
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
	if data.Id == "" {
		err = &errortypes.ParseError{
			errors.New("handler: Invalid profile ID"),
		}
		utils.AbortWithError(c, 400, err)
		return
	}

	sprfl := sprofile.Get(data.Id)
	if sprfl != nil {
		err = sprofile.Activate(data.Id, data.Mode, data.Password)
		if err != nil {
			utils.AbortWithError(c, 500, err)
			return
		}

		c.JSON(200, nil)
		return
	}

	prfl := profile.GetProfile(data.Id)
	if prfl != nil {
		prfl.Stop()
	}

	prfl = &profile.Profile{
		Id:                 data.Id,
		Mode:               data.Mode,
		OrgId:              data.OrgId,
		UserId:             data.UserId,
		ServerId:           data.ServerId,
		SyncHosts:          data.SyncHosts,
		SyncToken:          data.SyncToken,
		SyncSecret:         data.SyncSecret,
		Data:               data.Data,
		Username:           data.Username,
		Password:           data.Password,
		DynamicFirewall:    data.DynamicFirewall,
		DisableGateway:     data.DisableGateway,
		ForceDns:           data.ForceDns,
		SsoAuth:            data.SsoAuth,
		ServerPublicKey:    data.ServerPublicKey,
		ServerBoxPublicKey: data.ServerBoxPublicKey,
		TokenTtl:           data.TokenTtl,
		Reconnect:          data.Reconnect,
	}
	prfl.Init()

	go func() {
		_ = prfl.Start(data.Timeout, false, false)
	}()

	err = prfl.StartWait()
	if err != nil {
		err = &errortypes.ParseError{
			errors.Wrap(err, "handler: Start error"),
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
	if data.Id == "" {
		err = &errortypes.ParseError{
			errors.New("handler: Invalid profile ID"),
		}
		utils.AbortWithError(c, 400, err)
		return
	}

	sprfl := sprofile.Get(data.Id)
	if sprfl != nil {
		sprofile.Deactivate(data.Id)
		c.JSON(200, nil)
		return
	}

	prfl := profile.GetProfile(data.Id)
	if prfl != nil {
		prfl.Stop()
	}

	c.JSON(200, nil)
}

func profileDel2(c *gin.Context) {
	prflId := utils.FilterStr(c.Param("profile_id"))
	if prflId == "" {
		err := &errortypes.ParseError{
			errors.New("handler: Invalid profile ID"),
		}
		utils.AbortWithError(c, 400, err)
		return
	}

	sprfl := sprofile.Get(prflId)
	if sprfl != nil {
		sprofile.Deactivate(prflId)
		c.JSON(200, nil)
		return
	}

	prfl := profile.GetProfile(prflId)
	if prfl != nil {
		prfl.Stop()
	}

	c.JSON(200, nil)
}
