import electron from "electron"
import path from "path"
import os from "os"
import process from "process"

export let unix = false
export const unixPath = "/var/run/pritunl.sock"
export const webHost = "http://127.0.0.1:9770"
export const unixWsHost = "ws+unix://" + path.join(
	path.sep, "var", "run", "pritunl.sock") + ":"
export const webWsHost = "ws://127.0.0.1:9770"
export const platform = os.platform()
export const hostname = os.hostname()
export const logPath = path.join(electron.app.getPath("userData"),
	"pritunl.log");
export let mainWindow: electron.BrowserWindow

export let production = (process.argv.indexOf("--dev") === -1)
export let devTools = (process.argv.indexOf("--dev-tools") !== -1)

export let winDrive = "C:\\"
let systemDrv = process.env.SYSTEMDRIVE
if (systemDrv) {
	winDrive = systemDrv + "\\"
}

if (process.platform === "linux" || process.platform === "darwin") {
	unix = true
}

export function setMainWindow(mainWin: electron.BrowserWindow) {
	mainWindow = mainWin
}
