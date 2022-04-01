package tuntap

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/dropbox/godropbox/container/set"
	"github.com/pritunl/pritunl-client-electron/service/constants"
	"github.com/pritunl/pritunl-client-electron/service/utils"
)

var (
	curSize = 0
	taps    = set.NewSet()
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
		taps.Add(tapName)
	}

	return
}

func Size() int {
	return curSize
}

func Acquire() (tap string) {
	for tapInf := range taps.Iter() {
		tap = tapInf.(string)
	}
	taps.Remove(tap)

	return
}

func Release(tap string) {
	taps.Add(tap)
}
