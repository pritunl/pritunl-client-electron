import fs from "fs"
import path from "path"
import electron from "electron"
import * as Errors from "./Errors"
import * as Logger from "./Logger"

class ConfigData {
	window_width = 0
	window_height = 0
	disable_tray_icon = false
	classic_interface = false
	theme = "dark"

	path(): string {
		return path.join(electron.app.getPath("userData"), "pritunl.json")
	}

	load(): Promise<void> {
		return new Promise<void>((resolve): void => {
			fs.readFile(
				this.path(), "utf-8",
				(err: NodeJS.ErrnoException, data: string): void => {
					if (err) {
						if (err.code !== "ENOENT") {
							err = new Errors.ReadError(err, "Config: Read error")
						}

						resolve()
						return
					}

					let configData: any
					try {
						configData = JSON.parse(data)
					} catch (err) {
						err = new Errors.ReadError(err, "Config: Parse error")
						Logger.error(err.message)

						configData = {}
					}

					if (configData["disable_tray_icon"] !== undefined) {
						this.disable_tray_icon = configData["disable_tray_icon"]
					}
					if (configData["classic_interface"] !== undefined) {
						this.classic_interface = configData["classic_interface"]
					}
					if (configData["theme"] !== undefined) {
						this.theme = configData["theme"]
					}
					if (configData["window_width"] !== undefined) {
						this.window_width = configData["window_width"]
					}
					if (configData["window_height"] !== undefined) {
						this.window_height = configData["window_height"]
					}

					resolve()
				},
			)
		})
	}

	save(): Promise<void> {
		return new Promise<void>((resolve, reject): void => {
			fs.writeFile(
				this.path(), JSON.stringify({
					disable_tray_icon: this.disable_tray_icon,
					classic_interface: this.classic_interface,
					window_width: this.window_width,
					window_height: this.window_height,
					theme: this.theme,
				}),
				(err: NodeJS.ErrnoException): void => {
					if (err) {
						err = new Errors.ReadError(err, "Config: Write error")
						Logger.error(err.message)
					}

					resolve()
				},
			)
		})
	}
}

const Config = new ConfigData()
export default Config
