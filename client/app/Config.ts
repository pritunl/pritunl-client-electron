/// <reference path="./References.d.ts"/>
import * as Errors from "./Errors";
import * as Constants from "./Constants";
import * as Logger from "./Logger";
import fs from "fs";
import path from "path";

class ConfigData {
	disable_tray_icon = false;
	theme = "dark";

	configPath(): string {
		return path.join(Constants.dataPath, "pritunl.json");
	}

	load(): Promise<void> {
		return new Promise<void>((resolve, reject): void => {
			fs.readFile(
				this.configPath(), "utf-8",
				(err: NodeJS.ErrnoException, data: string): void => {
					if (err) {
						if (err.code !== "ENOENT") {
							err = new Errors.ReadError(err, "Config: Read error");
							Logger.errorAlert(err.message, 10);
						}

						resolve();
						return;
					}

					let configData: any;
					try {
						configData = JSON.parse(data);
					} catch (err) {
						err = new Errors.ReadError(err, "Config: Parse error");
						Logger.errorAlert(err.message, 10);

						configData = {};
					}

					if (configData["disable_tray_icon"] !== undefined) {
						this.disable_tray_icon = configData["disable_tray_icon"];
					}
					if (configData["theme"] !== undefined) {
						this.theme = configData["theme"];
					}

					resolve();
				},
			);
		});
	}

	save(): Promise<void> {
		let configPath = path.join(Constants.dataPath, "pritunl.json");

		return new Promise<void>((resolve, reject): void => {
			fs.writeFile(
				configPath, JSON.stringify({
					disable_tray_icon: this.disable_tray_icon,
					theme: this.theme,
				}),
				(err: NodeJS.ErrnoException): void => {
					if (err) {
						err = new Errors.ReadError(err, "Config: Write error");
						Logger.errorAlert(err.message);
					}

					resolve();
				},
			);
		});
	}
}

const Config = new ConfigData();
export default Config;
