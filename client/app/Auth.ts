/// <reference path="./References.d.ts"/>
import * as Constants from './Constants';
import fs from "fs";

export let token = '';

export function load(): void {
	fs.readFile(Constants.authPath, 'utf-8', (err, data: string): void => {
		if (err || !data) {
			setTimeout((): void => {
				load();
			}, 100);
			return;
		}

		token = data.trim();

		setTimeout((): void => {
			load();
		}, 3000);
	});
}
