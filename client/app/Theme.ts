/// <reference path="./References.d.ts"/>
import * as SuperAgent from 'superagent';
import * as Alert from './Alert';
import * as Csrf from './Csrf';

export let theme = 'dark';

export function save(): Promise<void> {
	return new Promise<void>((resolve, reject): void => {
		SuperAgent
			.put('/theme')
			.send({
				theme: theme,
			})
			.set('Accept', 'application/json')
			.set('Csrf-Token', Csrf.token)
			.end((err: any, res: SuperAgent.Response): void => {
				if (res && res.status === 401) {
					window.location.href = '/login';
					resolve();
					return;
				}

				if (err) {
					Alert.errorRes(res, 'Failed to save theme');
					reject(err);
					return;
				}

				resolve();
			});
	});
}

export function light(): void {
	theme = 'light';
	document.body.className = '';
}

export function dark(): void {
	theme = 'dark';
	document.body.className = 'bp3-dark';
}

export function toggle(): void {
	if (theme === 'light') {
		dark()
	} else {
		light();
	}
}
