import fs from "fs"
import path from "path"
import electron from "electron"
import * as Errors from "./Errors"
import * as Constants from "./Constants";

function push(level: string, err: any): void {
	if (!err) {
		err = "Undefined error"
	}

	let time = new Date()
	let msg = err.message || err

	msg = "[" + time.getFullYear() + "-" + (time.getMonth() + 1) + "-" +
		time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" +
		time.getSeconds() + "][" + level  + "] " + msg + "\n" + (err.stack || "")

	msg = msg.trim()

	let pth = Constants.logPath

	fs.stat(pth, (err: Error, stat) => {
		if (stat && stat.size > 200000) {
			fs.unlink(pth, () => {
				fs.appendFile(pth, msg + "\n", (err: Error): void => {
					if (err) {
						err = new Errors.WriteError(err, "Logger: Failed to write log",
							{log_path: pth})
						console.error(err)
					}
				})
			})
		} else {
			fs.appendFile(pth, msg + "\n", (err: Error): void => {
				if (err) {
					err = new Errors.WriteError(err, "Logger: Failed to write log",
						{log_path: pth})
					console.error(err)
				}
			})
		}
	})
}

export function info(err: any): void {
	push("INFO", err)
}

export function warning(err: any): void {
	push("WARN", err)
}

export function error(err: any): void {
	push("ERROR", err)
}
