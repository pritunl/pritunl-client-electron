import fs from "fs"
import path from "path"
import electron from "electron"
import * as Errors from "./Errors"

function push(level: string, msg: string): void {
	let time = new Date()
	msg = "[" + time.getFullYear() + "-" + (time.getMonth() + 1) + "-" +
		time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" +
		time.getSeconds() + "][" + level  + "] " + msg + "\n"

	console.error(msg)

	let logPath = path.join(electron.app.getPath("userData"), "pritunl.log")

	fs.appendFile(logPath, msg, (err: Error): void => {
		if (err) {
			err = new Errors.WriteError(err, "Logger: Failed to write log")
			console.error(err)
		}
	})
}

export function info(msg: string): void {
	push("INFO", msg)
}

export function warning(msg: string): void {
	push("WARN", msg)
}

export function error(msg: string): void {
	push("ERROR", msg)
}
