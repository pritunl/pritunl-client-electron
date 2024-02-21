import fs from "fs";
import process from "process";
import path from "path";
import {winDrive} from "./Service";

export let token = '';
export let unix = false
export const unixPath = "/var/run/pritunl.sock"
export const webHost = "http://127.0.0.1:9770"

if (process.platform === "linux" || process.platform === "darwin") {
	unix = true
}

function getAuthPath(): string {
	if (process.platform === "win32") {
		return path.join(winDrive, "ProgramData", "Pritunl", "auth")
	} else {
		return path.join(path.sep, "var", "run", "pritunl.auth")
	}
}

export function _load(): void {
	fs.readFile(getAuthPath(), 'utf-8', (err, data: string): void => {
		if (err || !data) {
			setTimeout((): void => {
				_load();
			}, 100);
			return;
		}

		token = data.trim();

		setTimeout((): void => {
			_load();
		}, 3000);
	});
}

export function load(): Promise<void> {
	return new Promise<void>((resolve, reject): void => {
		fs.readFile(getAuthPath(), 'utf-8', (err, data: string): void => {
			if (err || !data) {
				setTimeout((): void => {
					_load();
				}, 100);
				resolve();
				return;
			}

			token = data.trim();
			resolve();

			setTimeout((): void => {
				_load();
			}, 3000);
		})
	})
}
