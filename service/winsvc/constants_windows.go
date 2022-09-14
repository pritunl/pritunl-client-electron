package winsvc

import (
	"golang.org/x/sys/windows/svc"
)

func IsWindowsService() bool {
	isSvc, _ := svc.IsWindowsService()
	return isSvc
}
