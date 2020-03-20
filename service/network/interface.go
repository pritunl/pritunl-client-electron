package network

import (
	"fmt"
	"runtime"
	"sort"
	"sync"
)

var (
	interfaces     = []string{}
	interfacesLock = sync.Mutex{}
)

func InterfaceAcquire() (name string) {
	interfacesLock.Lock()
	defer interfacesLock.Unlock()

	if len(interfaces) > 0 {
		name, interfaces = interfaces[0], interfaces[1:]
	}

	return
}

func InterfaceRelease(name string) {
	if name == "" {
		return
	}

	interfacesLock.Lock()
	defer interfacesLock.Unlock()

	exists := false
	for _, iface := range interfaces {
		if name == iface {
			exists = true
			break
		}
	}

	if !exists {
		interfaces = append(interfaces, name)
		sort.Strings(interfaces)
	}

	return
}

func init() {
	switch runtime.GOOS {
	case "windows":
		for i := 0; i < 10; i++ {
			interfaces = append(interfaces, fmt.Sprintf("pritunl%d", i))
		}
		break
	case "darwin":
		for i := 0; i < 10; i++ {
			interfaces = append(interfaces, fmt.Sprintf("pritunl%d", i))
		}
		break
	default:
		for i := 0; i < 10; i++ {
			interfaces = append(interfaces, fmt.Sprintf("wg%d", i))
		}
	}
}
