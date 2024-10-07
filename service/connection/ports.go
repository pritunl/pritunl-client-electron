package connection

import (
	"sort"
	"sync"
)

var (
	ports     = []int{}
	portsLock = sync.Mutex{}
)

func ManagementPortAcquire() (port int) {
	portsLock.Lock()
	defer portsLock.Unlock()

	if len(ports) > 0 {
		port, ports = ports[0], ports[1:]
	}

	return
}

func ManagementPortRelease(port int) {
	if port == 0 {
		return
	}

	portsLock.Lock()
	defer portsLock.Unlock()

	exists := false
	for _, prt := range ports {
		if port == prt {
			exists = true
			break
		}
	}

	if !exists {
		ports = append(ports, port)
		sort.Ints(ports)
	}

	return
}

func init() {
	for i := 1; i < 100; i++ {
		ports = append(ports, 9700+i)
	}
}
