package connection

import (
	"runtime"
	"sync"

	"github.com/dropbox/godropbox/container/set"
	"github.com/pritunl/pritunl-client-electron/service/utils"
	"github.com/sirupsen/logrus"
)

var GlobalStore = &Store{
	conns: map[string]*Connection{},
}

type Store struct {
	dnsForced bool
	lock      sync.RWMutex
	conns     map[string]*Connection
}

func (s *Store) cleanState() {
	if runtime.GOOS == "darwin" && len(s.conns) == 0 {
		err := utils.ClearScutilConnKeys()
		if err != nil {
			logrus.WithFields(logrus.Fields{
				"error": err,
			}).Error("connection: Failed to clear scutil connection keys")
		}

		if s.dnsForced {
			utils.ClearDns()
			s.dnsForced = false
		}
	}
}

func (s *Store) IsActive() bool {
	s.lock.RLock()
	defer s.lock.RUnlock()

	return len(s.conns) > 0
}

func (s *Store) IsConnected() bool {
	s.lock.RLock()
	defer s.lock.RUnlock()

	for _, conn := range s.conns {
		if conn.Data.Status == Connected {
			return true
		}
	}

	return false
}

func (s *Store) Get(prflId string) (conn *Connection) {
	s.lock.RLock()
	defer s.lock.RUnlock()

	s.cleanState()
	conn = s.conns[prflId]

	return
}

func (s *Store) GetAll() (conns map[string]*Connection) {
	s.lock.RLock()
	defer s.lock.RUnlock()

	conns = map[string]*Connection{}

	s.cleanState()
	for _, conn := range s.conns {
		conns[conn.Id] = conn
	}

	return
}

func (s *Store) GetAllId() (connIds set.Set) {
	s.lock.RLock()
	defer s.lock.RUnlock()

	connIds = set.NewSet()

	s.cleanState()
	for _, conn := range s.conns {
		connIds.Add(conn.Id)
	}

	return
}

func (s *Store) SetDnsForced() {
	s.lock.Lock()
	s.dnsForced = true
	s.lock.Unlock()
}
