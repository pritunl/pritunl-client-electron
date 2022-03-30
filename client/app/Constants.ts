/// <reference path="./References.d.ts"/>
import path from "path";
import process from "process";

export const loadDelay = 700;
export let unix = false;
export const unixPath = "/var/run/pritunl.sock";
export const webHost = 'http://127.0.0.1:9770';
export const unixWsHost = 'ws+unix://' + path.join(
	path.sep, 'var', 'run', 'pritunl.sock') + ':';
export const webWsHost = 'ws://127.0.0.1:9770';

export const args = new Map<string, string>();
export let production = true;
export let authPath = '';

if (process.platform === 'linux' || process.platform === 'darwin') {
	unix = true;
}

let queryVals = window.location.search.substring(1).split('&');
for (let item of queryVals) {
	let items = item.split('=');
	if (items.length < 2) {
		continue;
	}

	let key = items[0];
	let value = items.slice(1).join('=');

	args.set(key, decodeURIComponent(value));
}

if (args.get('dev') === 'true') {
	production = false;
	authPath = path.join(__dirname, '..', '..', 'dev', 'auth');
} else {
	if (process.platform === 'win32') {
		authPath = path.join('C:\\', 'Program Files (x86)', 'Pritunl', 'auth');
	} else {
		authPath = path.join(path.sep, 'var', 'run', 'pritunl.auth');
	}
}

export const dataPath = args.get('dataPath');

export function load(): void {
}
