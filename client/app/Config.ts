/// <reference path="./References.d.ts"/>
import * as Constants from "./Constants";
import * as Errors from "./Errors";
import * as Logger from "./Logger";
import * as Paths from "./Paths";
import fs from "fs";

class ConfigData {
	disable_tray_icon = false;
	theme = "dark";

	load(): Promise<void> {
		return new Promise<void>((resolve, reject): void => {
			fs.readFile(
				Paths.config(), "utf-8",
				(err: NodeJS.ErrnoException, data: string): void => {
					if (err) {
						if (err.code !== "ENOENT") {
							err = new Errors.ReadError(err, "Config: Read error");
							Logger.errorAlert(err, 10);
						}

						resolve();
						return;
					}

					let configData: any;
					try {
						configData = JSON.parse(data);
					} catch (err) {
						err = new Errors.ReadError(err, "Config: Parse error");
						Logger.errorAlert(err, 10);

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
		return new Promise<void>((resolve, reject): void => {
			fs.writeFile(
				Paths.config(), JSON.stringify({
					disable_tray_icon: this.disable_tray_icon,
					theme: this.theme,
				}),
				(err: NodeJS.ErrnoException): void => {
					if (err) {
						err = new Errors.ReadError(err, "Config: Write error");
						Logger.errorAlert(err);
					}

					resolve();
				},
			);
		});
	}
}

const Config = new ConfigData();
export default Config;
