package sprofile

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strings"
	"sync"

	"github.com/Sirupsen/logrus"
	"github.com/dropbox/godropbox/errors"
	"github.com/pritunl/pritunl-client-electron/service/errortypes"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var (
	cache      = []*Sprofile{}
	cacheStale = true
	cacheLock  = sync.Mutex{}
)

func GetPath() string {
	switch runtime.GOOS {
	case "windows":
		return filepath.Join("C:\\", "ProgramData", "Pritunl", "Profiles")
	case "darwin":
		return filepath.Join("/", "var",
			"lib", "pritunl-client", "profiles")
	case "linux":
		return filepath.Join("/", "var",
			"lib", "pritunl-client", "profiles")
	default:
		panic("profile: Not implemented")
	}
}

func GetAll() (prfls []*Sprofile, err error) {
	if cacheStale {
		err = Reload(false)
		if err != nil {
			return
		}
	}

	prfls = []*Sprofile{}
	prflsCache := cache

	for _, prfl := range prflsCache {
		newPrlf := prfl.Copy()
		prfls = append(prfls, newPrlf)
	}

	return
}

func Remove(prflId string) {
	prflsPath := GetPath()
	prflPth := path.Join(prflsPath, fmt.Sprintf("%s.conf", prflId))
	logPth := path.Join(prflsPath, fmt.Sprintf("%s.log", prflId))

	_ = os.Remove(prflPth)
	_ = os.Remove(logPth)
}

func Reload(init bool) (err error) {
	cacheLock.Lock()
	defer cacheLock.Unlock()

	prflsPath := GetPath()
	prfls := []*Sprofile{}

	curPrfls := map[string]*Sprofile{}
	for _, prfl := range cache {
		curPrfls[prfl.Id] = prfl
	}

	files, err := ioutil.ReadDir(prflsPath)
	if err != nil {
		if os.IsNotExist(err) {
			err = nil
			return
		}

		err = &errortypes.ReadError{
			errors.Wrap(err, "sprofile: Failed to read profiles directory"),
		}
		return
	}

	for _, file := range files {
		name := file.Name()
		pth := path.Join(prflsPath, name)

		if !strings.HasSuffix(name, ".conf") {
			continue
		}

		data, e := ioutil.ReadFile(pth)
		if e != nil {
			logrus.WithFields(logrus.Fields{
				"path":  pth,
				"error": e,
			}).Error("sprofile: Failed to read profile configuration")
			continue
		}

		prfl := &Sprofile{
			Path: pth,
		}

		e = json.Unmarshal(data, prfl)
		if e != nil {
			logrus.WithFields(logrus.Fields{
				"path":  pth,
				"error": e,
			}).Error("sprofile: Failed to parse profile configuration")
			continue
		}

		if init {
			prfl.State = true
		} else {
			curPrfl := curPrfls[prfl.Id]
			if curPrfl != nil {
				prfl.State = curPrfl.State
			}
		}

		prfls = append(prfls, prfl)
	}

	cache = prfls
	cacheStale = false

	return
}

func ClearLog(prflId string) (err error) {
	prflsPath := GetPath()
	pth := path.Join(prflsPath, fmt.Sprintf("%s.log", prflId))

	err = utils.CreateWrite(pth, "", 0600)
	if err != nil {
		return
	}

	return
}
