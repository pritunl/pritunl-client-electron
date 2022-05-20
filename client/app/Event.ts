/// <reference path="./References.d.ts"/>
import WebSocket from 'ws';
import EventDispatcher from './dispatcher/EventDispatcher';
import * as Auth from './Auth';
import * as Alert from './Alert';
import * as Constants from './Constants';
import * as Errors from "./Errors";
import * as Logger from "./Logger";

let connected = false;
let showConnect = false;

function connect(): void {
	if (Auth.token === '') {
		setTimeout(() => {
			connect();
		}, 100);
		return;
	}

	let reconnected = false;
	let wsHost = '';
	let headers = {
		'User-Agent': 'pritunl',
		'Auth-Token': Auth.token,
	} as any;

	if (Constants.unix) {
		wsHost = Constants.unixWsHost;
		headers['Host'] = 'unix';
	} else {
		wsHost = Constants.webWsHost;
	}

	let reconnect = (): void => {
		setTimeout(() => {
			if (reconnected) {
				return;
			}
			reconnected = true;
			connect();
		}, 3500);
	};

	let socket = new WebSocket(wsHost + '/events', {
		headers: headers,
	});

	socket.on('open', (): void => {
		if (showConnect) {
			showConnect = false;
			Alert.success('Events: Service reconnected');
		}
	});

	socket.on('error', (err: Error) => {
		err = new Errors.RequestError(
			err, "Failed to connect to background service, retrying");
		Logger.errorAlert(err.message, 3);

		showConnect = true;
		reconnect();
	});

	socket.on('onerror', (err) => {
		err = new Errors.RequestError(
			err, "Failed to connect to background service, retrying");
		Logger.errorAlert(err.message, 3);

		showConnect = true;
		reconnect();
	});

	socket.on('close', () => {
		showConnect = true;
		reconnect();
	});

	socket.on('message', (dataBuf: Buffer): void => {
		let data = JSON.parse(dataBuf.toString());
		console.log(data);
		EventDispatcher.dispatch(data);
	});
}

export function init() {
	if (connected) {
		return;
	}
	connected = true;

	connect();
}
