/// <reference path="./References.d.ts"/>
import * as Errors from "./Errors";
import * as Constants from "./Constants";
import * as Alert from "./Alert";
import fs from "fs";
import path from "path";

export let token = '';

export let disableTrayIcon = false;
export function setDisableTrayIcon(val: boolean) {
	disableTrayIcon = val;
}

export let theme = 'dark';
export function setTheme(val: string) {
	theme = val;
}

export function load(): Promise<void> {
	let configPath = path.join(Constants.dataPath, 'pritunl.json');

	return new Promise<void>((resolve, reject): void => {
		fs.readFile(
			configPath, 'utf-8',
			(err: NodeJS.ErrnoException, data: string): void => {
				if (err) {
					if (err.code !== 'ENOENT') {
						err = new Errors.ReadError('Config: Read error', err);
						Alert.error(err.message);
					}
					resolve();
					return;
				}

				let configData: any = {};
				try {
					configData = JSON.parse(data);
				} catch (e) {
					err = new Errors.ReadError('Config: Parse error', e);
					Alert.error(err.message);
					configData = {};
				}

				if (configData['disable_tray_icon'] !== undefined) {
					disableTrayIcon = configData['disable_tray_icon'];
				}
				if (configData['theme'] !== undefined) {
					theme = configData['theme'];
				}

				resolve();
			},
		);
	});
}

export function save(): Promise<void> {
	let configPath = path.join(Constants.dataPath, 'pritunl.json');

	return new Promise<void>((resolve, reject): void => {
		fs.writeFile(
			configPath, JSON.stringify({
				disable_tray_icon: disableTrayIcon,
				theme: theme,
			}),
			(err: NodeJS.ErrnoException): void => {
				if (err) {
					err = new Errors.ReadError('Config: Write error', err);
					Alert.error(err.message);
				}

				resolve();
			},
		);
	});
}
