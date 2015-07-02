package main

import (
	"os/exec"
)

func main() {
	exec.Command("net.exe", "stop", "pritunl").Run()
	exec.Command("taskkill.exe", "/F", "/IM pritunl.exe").Run()
}
