/// <reference path="./References.d.ts"/>
import * as SuperAgent from 'superagent';
import * as Theme from './Theme';
import * as Constants from './Constants';
import fs from "fs";

export let token = '';

export function load(): void {
	fs.readFile(Constants.authPath, 'utf-8', (err, data: string): void => {
		if (err) {
			setTimeout((): void => {
				load();
			}, 100);
			return;
		}

		token = data.trim();

		setTimeout((): void => {
			load();
		}, 1000);
	});

	// return new Promise<void>((resolve, reject): void => {
	// 	SuperAgent
	// 		.get('/csrf')
	// 		.set('Accept', 'application/json')
	// 		.end((err: any, res: SuperAgent.Response): void => {
	// 			if (res && res.status === 401) {
	// 				window.location.href = '/login';
	// 				resolve();
	// 				return;
	// 			}
	//
	// 			if (err) {
	// 				reject(err);
	// 				return;
	// 			}
	//
	// 			token = res.body.token;
	//
	// 			if (res.body.theme === 'light') {
	// 				Theme.light();
	// 			} else {
	// 				Theme.dark();
	// 			}
	//
	// 			resolve();
	// 		});
	// });
}
