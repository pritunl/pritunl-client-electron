package connection

import (
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
)

type Options struct {
	Deadline  bool
	Delay     bool
	Automatic bool
	Fork      bool
}

type Connection struct {
	Id      string
	Profile *Profile
	Data    *Data
	State   *State
	Client  *Client
	Ovpn    *Ovpn
	Wg      *Wg
}

func (c *Connection) Init() (err error) {
	c.Ovpn.Init()
	c.Wg.Init()

	return
}

func (c *Connection) Fields(fields ...logrus.Fields) logrus.Fields {
	newFields := logrus.Fields{}

	for _, fieldSet := range fields {
		for key, val := range fieldSet {
			newFields[key] = val
		}
	}

	for key, val := range c.Profile.Fields() {
		newFields[key] = val
	}

	for key, val := range c.Data.Fields() {
		newFields[key] = val
	}

	for key, val := range c.State.Fields() {
		newFields[key] = val
	}

	for key, val := range c.Client.Fields() {
		newFields[key] = val
	}

	for key, val := range c.Ovpn.Fields() {
		newFields[key] = val
	}

	for key, val := range c.Wg.Fields() {
		newFields[key] = val
	}

	return newFields
}

func (c *Connection) Start(opts Options) (err error) {
	err = c.State.Init(opts)
	if err != nil {
		c.State.Close()
		return
	}

	if c.State.IsStop() {
		c.State.Close()
		return
	}

	c.State.SetConnecting()

	conn := GlobalStore.Get(c.Id)
	if conn != nil {
		logrus.WithFields(conn.Fields(nil)).Info(
			"profile: Profile already active, disconnecting")
		conn.StopWait()
	}

	if c.State.IsStop() {
		c.State.Close()
		return
	}

	c.Profile.Sync()

	if c.State.IsStop() {
		c.State.Close()
		return
	}

	if c.Profile.Mode == WgMode {
		err = c.Wg.Start()
	} else {
		err = c.Ovpn.Start()
	}
	if err != nil {
		c.State.Close()
		return
	}

	return
}

func (c *Connection) StopWait() {
	c.State.Stop()

	c.State.CloseWait()

	return
}

func NewConnection(prfl *Profile) (conn *Connection, err error) {
	prfl.Id = utils.FilterStrN(prfl.Id, 128)

	conn = &Connection{
		Id:      prfl.Id,
		Profile: prfl,
		Data: &Data{
			conn: conn,
		},
		State: &State{
			conn: conn,
		},
		Client: &Client{
			conn: conn,
		},
		Ovpn: &Ovpn{
			conn: conn,
		},
		Wg: &Wg{
			conn: conn,
		},
	}
	prfl.conn = conn

	return
}
