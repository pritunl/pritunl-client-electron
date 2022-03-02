/// <reference path="./References.d.ts"/>
import * as Constants from "./Constants"
import * as Alert from "./Alert"
import * as Errors from "./Errors"
import * as Paths from "./Paths"
import fs from "fs"

function push(level: string, msg: string): void {
	let time = new Date()
	msg = "[" + time.getFullYear() + "-" + (time.getMonth() + 1) + "-" +
		time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" +
		time.getSeconds() + "][" + level  + "] " + msg + "\n"

	console.error(msg)

	fs.appendFile(Paths.log(), msg, (err: Error): void => {
		if (err) {
			err = new Errors.WriteError(err, "Logger: Failed to write log")
			Alert.error(err.message, 10)
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

export function errorAlert(msg: string, timeout?: number): void {
	push("ERROR", msg)
	Alert.error(msg, timeout)
}
