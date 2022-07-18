import WebSocket from "ws"
import fs from "fs"
import path from "path"
import process from "process"
import * as Request from "./Request"
import * as Logger from "./Logger"

export interface Event {
	id: string
	type: string
	data?: any
}

export type Callback = (event: Event) => void

let unix = false
const unixPath = "/var/run/pritunl.sock"
const webHost = "http://127.0.0.1:9770"
const unixWsHost = "ws+unix://" + path.join(
	path.sep, "var", "run", "pritunl.sock") + ":"
const webWsHost = "ws://127.0.0.1:9770"

let showConnect = false
let socket: WebSocket.WebSocket
let callbacks: Callback[] = []

export let winDrive = 'C:\\';
let systemDrv = process.env.SYSTEMDRIVE;
if (systemDrv) {
	winDrive = systemDrv + '\\';
}

if (process.platform === "linux" || process.platform === "darwin") {
	unix = true
}

function getAuthPath(): string {
	if (process.argv.indexOf("--dev") !== -1) {
		return path.join(__dirname, "..", "..", "dev", "auth")
	} else {
		if (process.platform === "win32") {
			return path.join(winDrive, "ProgramData", "Pritunl", "auth")
		} else {
			return path.join(path.sep, "var", "run", "pritunl.auth")
		}
	}
}

function getAuthToken(): Promise<string> {
	return new Promise<string>((resolve, reject): void => {
		fs.readFile(getAuthPath(), "utf-8", (err, data: string): void => {
			resolve(data.trim())
		})
	})
}

export function sync(): Promise<boolean> {
	return new Promise<boolean>(async (resolve) => {
		let token: string
		try {
			token = await getAuthToken()
		} catch(err) {
			Logger.error(err.message || err)
			resolve(false)
			return
		}

		let req = new Request.Request()

		if (unix) {
			req.unix(unixPath)
		} else {
			req.tcp(webHost)
		}

		req.get("/status")
			.set("Auth-Token", token)
			.set("User-Agent", "pritunl")
			.end()
			.then((resp: Request.Response) => {
				if (resp.status === 200) {
					let data = resp.jsonPassive() as any
					if (data) {
						resolve(data.status)
					} else {
						resolve(false)
					}
				} {
					resolve(false)
				}
			}, (err) => {
				Logger.error(err.message)
				resolve(false)
			})
	})
}

export function wakeup(): Promise<boolean> {
	return new Promise<boolean>(async (resolve) => {
		let token: string
		try {
			token = await getAuthToken()
		} catch(err) {
			Logger.error(err.message || err)
			resolve(false)
			return
		}

		let req = new Request.Request()

		if (unix) {
			req.unix(unixPath)
		} else {
			req.tcp(webHost)
		}

		req.post("/wakeup")
			.set("Auth-Token", token)
			.set("User-Agent", "pritunl")
			.end()
			.then((resp: Request.Response) => {
				if (resp.status === 200) {
					resolve(true)
				} {
					resolve(false)
				}
			}, (err) => {
				Logger.error(err.message)
				resolve(false)
			})
	})
}

export function connect(dev: boolean): Promise<void> {
	return new Promise<void>(async (resolve, reject) => {
		let token: string
		try {
			token = await getAuthToken()
		} catch(err) {
			token = ""
		}

		if (!token) {
			setTimeout((): void => {
				connect(dev)
			}, 200)
			return
		}

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
}

export function send(msg: string) {
	if (socket) {
		socket.send(msg)
	}
}

export function subscribe(callback: Callback) {
	callbacks.push(callback)
}
