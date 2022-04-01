package main

import (
	"os"
	"os/exec"
	"path/filepath"
)

const signtool = "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.18362.0\\x64\\signtool.exe"

func main() {
	err := os.Remove(filepath.Join("openvpn_win",
		"OpenVPN-2.5.3-I601-amd64.msi"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.Remove(filepath.Join("openvpn_win",
		"OpenVPN-2.5.3-I601-amd64.msi.asc"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.Remove(filepath.Join("build", "win", "Pritunl.exe"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.RemoveAll(filepath.Join("build", "win"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.Chdir("tuntap_win")
	if err != nil {
		panic(err)
	}

	cmd := exec.Command("go", "build", "-v", "-o", "tuntap.exe")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(signtool,
		"sign",
		"/a",
		"/n", "Pritunl",
		"/tr", "http://timestamp.digicert.com",
		"/td", "sha256",
		"/fd", "sha256",
		"/d", "Pritunl",
		"tuntap.exe",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "service"))
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("go", "get", "-u")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("go", "build", "-v", "-ldflags", "-H windowsgui")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(signtool,
		"sign",
		"/a",
		"/n", "Pritunl",
		"/tr", "http://timestamp.digicert.com",
		"/td", "sha256",
		"/fd", "sha256",
		"/d", "Pritunl",
		"service.exe",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "client"))
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("npm", "install")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("npm", "update")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(".\\node_modules\\.bin\\electron-rebuild")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(
		".\\node_modules\\.bin\\electron-packager",
		".\\",
		"pritunl",
		"--platform=win32",
		"--arch=x64",
		"--icon=www\\img\\logo.ico",
		"--out=..\\build\\win",
		"--prune",
		"--asar",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "build", "win",
		"pritunl-win32-x64"))
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(signtool,
		"sign",
		"/a",
		"/n", "Pritunl",
		"/tr", "http://timestamp.digicert.com",
		"/td", "sha256",
		"/fd", "sha256",
		"/d", "Pritunl",
		"pritunl.exe",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "..", "..",
		"resources_win", "post_install"))
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("go", "build", "-v")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(signtool,
		"sign",
		"/a",
		"/n", "Pritunl",
		"/tr", "http://timestamp.digicert.com",
		"/td", "sha256",
		"/fd", "sha256",
		"/d", "Pritunl",
		"post_install.exe",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "pre_uninstall"))
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("go", "build", "-v")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(signtool,
		"sign",
		"/a",
		"/n", "Pritunl",
		"/tr", "http://timestamp.digicert.com",
		"/td", "sha256",
		"/fd", "sha256",
		"/d", "Pritunl",
		"pre_uninstall.exe",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "..", "service_win"))
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(signtool,
		"sign",
		"/a",
		"/n", "Pritunl",
		"/tr", "http://timestamp.digicert.com",
		"/td", "sha256",
		"/fd", "sha256",
		"/d", "Pritunl",
		"nssm.exe",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "resources_win"))
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe",
		"setup.iss")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}
}
