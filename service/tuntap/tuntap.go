package tuntap

import (
	"fmt"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var (
	curSize  = 0
	taps     = []string{}
	tapsLock = sync.Mutex{}
)

func getToolpath() (pth string) {
	if constants.Development {
		return filepath.Join(utils.GetRootDir(), "..",
			"openvpn", "tapctl.exe")
	}

	return filepath.Join(utils.GetRootDir(), "openvpn", "tapctl.exe")
}

func Get() (adpaters []string, err error) {
	toolpath := getToolpath()

	output, err := utils.ExecCombinedOutputLogged(
		nil,
		toolpath,
		"list",
	)
	if err != nil {
		return
	}

	adpaters = []string{}
	for _, line := range strings.Split(output, "\n") {
		if !strings.Contains(strings.ToLower(line), "pritunl") {
			continue
		}

		lines := strings.Fields(line)
		if len(lines) < 2 {
			continue
		}

		adpaters = append(adpaters, lines[0])
	}

	return
}

func Clean() (err error) {
	toolpath := getToolpath()

	adapters, err := Get()
	if err != nil {
		return
	}

	for _, adapter := range adapters {
		_, _ = utils.ExecCombinedOutputLogged(
			[]string{
				"No devices",
			},
			toolpath,
			"delete",
			adapter,
		)
	}

	curSize = 0

	return
}

func Resize(size int) (err error) {
	tapsLock.Lock()
	defer tapsLock.Unlock()

	toolpath := getToolpath()

	if size <= 3 {
		size = 3
	} else if size < 6 {
		size = 6
	} else {
		size = 9
	}

	add := size - curSize

	for i := 0; i < add; i++ {
		tapName := fmt.Sprintf("Pritunl %d", curSize+1)

		_, err = utils.ExecCombinedOutputLogged(
			nil,
			toolpath,
			"create",
			"--name", tapName,
		)
		if err != nil {
			_, _ = utils.ExecCombinedOutputLogged(
				[]string{
					"No devices",
				},
				toolpath,
				"delete",
				tapName,
			)

			_, err = utils.ExecCombinedOutputLogged(
				nil,
				toolpath,
				"create",
				"--name", tapName,
			)
			if err != nil {
				_ = Clean()
				return
			}
		}

		curSize += 1
		taps = append(taps, tapName)

		time.Sleep(200 * time.Millisecond)
	}

	sort.Strings(taps)

	return
}

func Size() int {
	return curSize
}

func Acquire() (tap string) {
	tapsLock.Lock()
	defer tapsLock.Unlock()

	tap, taps = taps[0], taps[1:]

	return
}

func Release(tap string) {
	tapsLock.Lock()
	defer tapsLock.Unlock()

	taps = append(taps, tap)
	sort.Strings(taps)
}
