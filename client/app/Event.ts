/// <reference path="./References.d.ts"/>
import WebSocket from 'ws';
import * as Electron from "electron";
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

	let reconnect = (): void => {
		setTimeout(() => {
			if (reconnected) {
				return;
			}
			reconnected = true;
			connect();
		}, 3500);
	};

	Electron.ipcRenderer.send("websocket.connect")

	Electron.ipcRenderer.on('websocket.open', (): void => {
		if (showConnect) {
			showConnect = false;
			Alert.success('Events: Service reconnected');
			Alert.clearAlert2();
		}
	});

	Electron.ipcRenderer.on('websocket.error', (evt, errStr: string) => {
		let err = new Error(errStr)
		err = new Errors.RequestError(
			err, "Failed to connect to background service, retrying");
		Logger.errorAlert2(err, 3);

		showConnect = true;
		reconnect();
	});

	Electron.ipcRenderer.on('websocket.close', () => {
		showConnect = true;
		reconnect();
	});

	Electron.ipcRenderer.on('websocket.message', (evt, dataStr: string): void => {
		let data = JSON.parse(dataStr);
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
