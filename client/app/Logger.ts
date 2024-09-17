/// <reference path="./References.d.ts"/>
import * as Alert from "./Alert"
import * as Errors from "./Errors"
import * as Paths from "./Paths"
import fs from "fs"

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

	let pth = Paths.log()

	fs.stat(pth, (err: Error, stat) => {
		if (stat && stat.size > 200000) {
			fs.unlink(pth, () => {
				fs.appendFile(pth, msg + "\n", (err: Error): void => {
					if (err) {
						err = new Errors.WriteError(err, "Logger: Failed to write log",
							{log_path: pth})
						Alert.error2(err.message, 10)
					}
				})
			})
		} else {
			fs.appendFile(pth, msg + "\n", (err: Error): void => {
				if (err) {
					err = new Errors.WriteError(err, "Logger: Failed to write log",
						{log_path: pth})
					Alert.error2(err.message, 10)
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

export function errorAlert(err: any, timeout?: number): void {
	if (!err) {
		err = "Undefined error"
	}

	push("ERROR", err)
	Alert.error(err.message || err, timeout)
}

export function errorAlert2(err: any, timeout?: number): void {
	if (!err) {
		err = "Undefined error"
	}

	push("ERROR", err)
	Alert.error2(err.message || err, timeout)
}
