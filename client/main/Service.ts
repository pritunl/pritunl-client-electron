import WebSocket from "ws"
import fs from "fs"
import path from "path"
import process from "process"

import * as Request from "./Request"

export interface Event {
	id: string
	type: string
	data?: any
}

export type Callback = (event: Event) => void

let unix = false
const unixPath = "/var/run/pritunl.sock"
const webHost = "https://127.0.0.1:9770"
const unixWsHost = "ws+unix://" + path.join(
	path.sep, "var", "run", "pritunl.sock") + ":"
const webWsHost = "ws://127.0.0.1:9770"

const args = new Map<string, string>()
let authPath = ""
let connected = false
let showConnect = false
let token = ""
let socket: WebSocket.WebSocket
let callbacks: Callback[] = []

if (process.platform === "linux" || process.platform === "darwin") {
	unix = true
}

export function wakeup(): Promise<boolean> {
	return new Promise<boolean>((resolve, reject): void => {
		let req = new Request.Request()

		if (unix) {
			req.unix(unixPath)
		} else {
			req.tcp(webHost)
		}

		req.set("Auth-Token", token)
		req.set("User-Agent", "pritunl")

		req.post("/wakeup")
			.end()
			.then((resp: Request.Response) => {
				if (resp.status === 200) {
					resolve(true)
				} {
					resolve(false)
				}
			}, (err) => {
				resolve(false)
			})
	})
}

export function connect(dev: boolean): Promise<void> {
	return new Promise<void>((resolve, reject): void => {
		if (dev) {
			authPath = path.join(__dirname, "..", "..", "dev", "auth")
		} else {
			if (process.platform === "win32") {
				authPath = path.join("C:\\", "ProgramData", "Pritunl", "auth")
			} else {
				authPath = path.join(path.sep, "var", "run", "pritunl.auth")
			}
		}

		fs.readFile(authPath, "utf-8", (err, data: string): void => {
			if (err) {
				setTimeout((): void => {
					connect(dev)
				}, 100)
				return
			}

			token = data.trim()

			resolve()

			if (token === "") {
				setTimeout(() => {
					connect(dev)
				}, 300)
				return
			}

			let reconnected = false
			let wsHost = ""
			let headers = {
				"User-Agent": "pritunl",
				"Auth-Token": token,
			} as any

			if (unix) {
				wsHost = unixWsHost
				headers["Host"] = "unix"
			} else {
				wsHost = webWsHost
			}

			let reconnect = (): void => {
				setTimeout(() => {
					if (reconnected) {
						return
					}
					reconnected = true
					connect(dev)
				}, 1000)
			}

			socket = new WebSocket(wsHost + "/events", {
				headers: headers,
			})

			socket.on("open", (): void => {
				if (showConnect) {
					showConnect = false
					console.log("Events: Service reconnected")
				}
			})

			socket.on("error", (err: Error) => {
				console.error("Events: Socket error " + err)
				showConnect = true
				reconnect()
			})

			socket.on("onerror", (err) => {
				console.error("Events: Socket error " + err)
				showConnect = true
				reconnect()
			})

			socket.on("close", () => {
				showConnect = true
				reconnect()
			})

			socket.on("message", (dataBuf: Buffer): void => {
				let data = JSON.parse(dataBuf.toString())
				for (let callback of callbacks) {
					callback(data as Event)
				}
			})
		})
	})
}

export function send(msg: string) {
	if (socket) {
		socket.send(msg)
	}
}

export function subscribe(callback: Callback) {
	callbacks.push(callback)
}
