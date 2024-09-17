/// <reference path="./References.d.ts"/>
import * as Electron from "electron"
import EventDispatcher from "./dispatcher/EventDispatcher"
import * as Alert from './Alert';
import * as Errors from "./Errors";
import * as Logger from "./Logger";

let connectionLost = false
let registered = false

export function init() {
	if (registered) {
		return
	}
	registered = true

	Electron.ipcRenderer.on("event.reconnected", (): void => {
		connectionLost = false
		Alert.success("Events: Service connection restored")
		Alert.clearAlert2()
	})

	Electron.ipcRenderer.on("event.closed", (evt, errStr: string) => {
		if (!connectionLost) {
			connectionLost = true
			Alert.error("Events: Service connection lost")
		}
	})

	Electron.ipcRenderer.on("event.error", (evt, errStr: string) => {
		let err = new Error(errStr)
		err = new Errors.RequestError(
			err, "Failed to connect to background service, retrying")
		Logger.errorAlert2(err, 3)
	})

	Electron.ipcRenderer.on("event", (evt, dataStr: string): void => {
		let data = JSON.parse(dataStr)
		EventDispatcher.dispatch(data)
	});
}
