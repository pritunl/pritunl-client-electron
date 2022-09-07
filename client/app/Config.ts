/// <reference path="./References.d.ts"/>
import * as Errors from "./Errors"
import * as Logger from "./Logger"
import * as Paths from "./Paths"
import * as Constants from "./Constants"
import fs from "fs"

class ConfigData {
	window_width = 0
	window_height = 0
	disable_tray_icon = false
	classic_interface = false
	frameless: boolean = null
	theme = "dark"

	_load(data: {[key: string]: any}): void {
		if (data["disable_tray_icon"] !== undefined) {
			this.disable_tray_icon = data["disable_tray_icon"]
		}
		if (data["classic_interface"] !== undefined) {
			this.classic_interface = data["classic_interface"]
		}
		if (data["theme"] !== undefined) {
			this.theme = data["theme"]
		}
		if (data["window_width"] !== undefined) {
			this.window_width = data["window_width"]
		}
		if (data["window_height"] !== undefined) {
			this.window_height = data["window_height"]
		}
		if (data["frameless"] !== undefined) {
			this.frameless = data["frameless"]
		}
	}

	load(): Promise<void> {
		return new Promise<void>((resolve, reject): void => {
			fs.readFile(
				Paths.config(), "utf-8",
				(err: NodeJS.ErrnoException, data: string): void => {
					if (err) {
						if (err.code !== "ENOENT") {
							err = new Errors.ReadError(err, "Config: Read error")
							Logger.errorAlert(err, 10)
						}

						resolve()
						return
					}

					let configData: any = {}
					if (data) {
						try {
							configData = JSON.parse(data)
						} catch (err) {
							err = new Errors.ReadError(err, "Config: Parse error")
							Logger.errorAlert(err, 10)

							configData = {}
						}
					}

					this._load(configData)

					Constants.triggerChange()
					resolve()
				},
			)
		})
	}

	save(opts: {[key: string]: any}): Promise<void> {
		let data = {
			disable_tray_icon: opts["disable_tray_icon"],
			classic_interface: opts["classic_interface"],
			window_width: opts["window_width"],
			window_height: opts["window_height"],
			frameless: opts["frameless"],
			theme: opts["theme"],
		}

		return new Promise<void>((resolve, reject): void => {
			this.load().then((): void => {
				if (data.disable_tray_icon === undefined) {
					data.disable_tray_icon = this.disable_tray_icon
				}
				if (data.classic_interface === undefined) {
					data.classic_interface = this.classic_interface
				}
				if (data.window_width === undefined) {
					data.window_width = this.window_width
				}
				if (data.theme === undefined) {
					data.theme = this.theme
				}
				if (data.frameless === undefined) {
					data.frameless = this.frameless
				}

				this._load(data)

				fs.writeFile(
					Paths.config(), JSON.stringify(data),
					(err: NodeJS.ErrnoException): void => {
						if (err) {
							err = new Errors.ReadError(err, "Config: Write error")
							Logger.errorAlert(err)
						}
						Constants.triggerChange()
						resolve()
					},
				)
			})
		})
	}
}

const Config = new ConfigData()
export default Config
