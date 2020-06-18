package handlers

import (
	"github.com/dropbox/godropbox/errors"
	"github.com/gin-gonic/gin"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/profile"
	"github.com/pritunl/pritunl-client-electron/service/sprofile"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

type sprofileData struct {
	Id                 string   `json:"id"`
	Name               string   `json:"name"`
	Wg                 bool     `json:"wg"`
	OrganizationId     string   `json:"organization_id"`
	Organization       string   `json:"organization"`
	ServerId           string   `json:"server_id"`
	Server             string   `json:"server"`
	UserId             string   `json:"user_id"`
	User               string   `json:"user"`
	PreConnectMsg      string   `json:"pre_connect_msg"`
	PasswordMode       string   `json:"password_mode"`
	Token              bool     `json:"token"`
	TokenTtl           int      `json:"token_ttl"`
	DisableReconnect   bool     `json:"disable_reconnect"`
	SyncHosts          []string `json:"sync_hosts"`
	SyncHash           string   `json:"sync_hash"`
	SyncSecret         string   `json:"sync_secret"`
	SyncToken          string   `json:"sync_token"`
	ServerPublicKey    []string `json:"server_public_key"`
	ServerBoxPublicKey string   `json:"server_box_public_key"`
	OvpnData           string   `json:"ovpn_data"`
}

func sprofilesGet(c *gin.Context) {
	prfls, err := sprofile.GetAll()
	if err != nil {
		utils.AbortWithError(c, 500, err)
		return
	}

	c.JSON(200, prfls)
}

func sprofilePut(c *gin.Context) {
	data := &sprofileData{}

	err := c.Bind(data)
	if err != nil {
		err = &errortypes.ParseError{
			errors.Wrap(err, "handler: Bind error"),
		}
		utils.AbortWithError(c, 400, err)
		return
	}
	data.Id = utils.FilterStr(data.Id)

	prfl := &sprofile.Sprofile{
		Id:                 data.Id,
		Name:               data.Name,
		Wg:                 data.Wg,
		OrganizationId:     data.OrganizationId,
		Organization:       data.Organization,
		ServerId:           data.ServerId,
		Server:             data.Server,
		UserId:             data.UserId,
		User:               data.User,
		PreConnectMsg:      data.PreConnectMsg,
		PasswordMode:       data.PasswordMode,
		Token:              data.Token,
		TokenTtl:           data.TokenTtl,
		DisableReconnect:   data.DisableReconnect,
		SyncHosts:          data.SyncHosts,
		SyncHash:           data.SyncHash,
		SyncSecret:         data.SyncSecret,
		SyncToken:          data.SyncToken,
		ServerPublicKey:    data.ServerPublicKey,
		ServerBoxPublicKey: data.ServerBoxPublicKey,
		OvpnData:           data.OvpnData,
	}

	err = prfl.Commit()
	if err != nil {
		utils.AbortWithError(c, 500, err)
		return
	}

	c.JSON(200, prfl)
}

func sprofileDel(c *gin.Context) {
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

	sprofile.Remove(data.Id)

	c.JSON(200, nil)
}

func sprofileLogDel(c *gin.Context) {
	data := &profileData{}

	err := c.Bind(data)
	if err != nil {
		utils.AbortWithError(c, 400, err)
		return
	}
	data.Id = utils.FilterStr(data.Id)

	err = sprofile.ClearLog(data.Id)
	if err != nil {
		utils.AbortWithError(c, 500, err)
		return
	}

	c.JSON(200, nil)
}
