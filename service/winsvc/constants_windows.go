package winsvc

import (
	"golang.org/x/sys/windows/svc"
)

func IsWindowsService() bool {
	return svc.IsWindowsService
}
