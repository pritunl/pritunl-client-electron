/// <reference path="./References.d.ts"/>
import * as SuperAgent from 'superagent';
import * as Theme from './Theme';

export let token = '';

export function load(): Promise<void> {
	return new Promise<void>((resolve, reject): void => {
		resolve();
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
