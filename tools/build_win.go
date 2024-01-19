package main

import (
	"os"
	"os/exec"
	"path/filepath"
)

const signtool = "C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.22621.0\\x64\\signtool.exe"

func main() {
	err := os.Remove(filepath.Join("openvpn_win",
		"OpenVPN-2.5.6-I601-amd64.msi"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.Remove(filepath.Join("openvpn_win",
		"OpenVPN-2.5.6-I601-amd64.msi.asc"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.Remove(filepath.Join("tuntap_win",
		"tapinstall.exe"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.Remove(filepath.Join("tuntap_win",
		"tuntap.go"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.Remove(filepath.Join("tuntap_win",
		"tuntap.exe"))
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.RemoveAll("build")
	if err != nil && !os.IsNotExist(err) {
		panic(err)
	}

	err = os.Chdir("service")
	if err != nil {
		panic(err)
	}

	cmd := exec.Command("go", "get")
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
		"/sha1", "055219bfb2cfe0b43a7e653da125b2f74bbe3003",
		"/tr", "http://timestamp.sectigo.com",
		"/td", "sha256",
		"/fd", "sha256",
		"service.exe",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "cli"))
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("go", "get")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
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

	cmd = exec.Command("npx",
		"@electron/fuses",
		"write", "--app", "pritunl.exe",
		"EnableNodeOptionsEnvironmentVariable=off",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("npx",
		"@electron/fuses",
		"write", "--app", "pritunl.exe",
		"EnableNodeCliInspectArguments=off",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("npx",
		"@electron/fuses",
		"write", "--app", "pritunl.exe",
		"EnableEmbeddedAsarIntegrityValidation=on",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("npx",
		"@electron/fuses",
		"write", "--app", "pritunl.exe",
		"OnlyLoadAppFromAsar=on",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command("npx",
		"@electron/fuses",
		"write", "--app", "pritunl.exe",
		"LoadBrowserProcessSpecificV8Snapshot=on",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	cmd = exec.Command(signtool,
		"sign",
		"/sha1", "055219bfb2cfe0b43a7e653da125b2f74bbe3003",
		"/tr", "http://timestamp.sectigo.com",
		"/td", "sha256",
		"/fd", "sha256",
		"pritunl.exe",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		panic(err)
	}

	err = os.Chdir(filepath.Join("..", "..", "..",
		"resources_win"))
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
