import WebSocket from "ws"
import path from "path"
import process from "process"
import * as Auth from "./Auth"
import electron from "electron"

export function bind(): void {
	electron.ipcMain.on("websocket.connect", (evt) => {
		let wsHost = '';
		let headers = {
			'User-Agent': 'pritunl',
			'Auth-Token': Auth.token,
		} as any

		if (process.platform === "linux" || process.platform === "darwin") {
			wsHost = "ws+unix://" + path.join(
				path.sep, "var", "run", "pritunl.sock") + ":"
			headers['Host'] = 'unix'
		} else {
			wsHost = "ws://127.0.0.1:9770"
		}

		let socket = new WebSocket(wsHost + '/events', {
			headers: headers,
		})

		socket.on('open', (): void => {
			evt.sender.send('websocket.open')
		})

		socket.on('error', (err: Error) => {
			evt.sender.send('websocket.error', err.toString())
		})

		socket.on('onerror', (err) => {
			evt.sender.send('websocket.error', err.toString())
		})

		socket.on('close', () => {
			evt.sender.send('websocket.close')
		})

		socket.on('message', (dataBuf: Buffer): void => {
			evt.sender.send('websocket.message', dataBuf.toString())
		})
	})
}
