import fs from "fs"
import path from "path"
import electron from "electron"
import * as Errors from "./Errors"
import * as Logger from "./Logger"

class ConfigData {
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
