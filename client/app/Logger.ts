/// <reference path="./References.d.ts"/>
import * as Constants from "./Constants";
import * as Alert from "./Alert";
import fs from "fs";
import path from "path";

function logPath(): string {
	return path.join(Constants.dataPath, "pritunl.json");
}

function push(level: string, msg: string): void {
	let time = new Date();
	msg = "[" + time.getFullYear() + "-" + (time.getMonth() + 1) + "-" +
		time.getDate() + " " + time.getHours() + ":" + time.getMinutes() + ":" +
		time.getSeconds() + "][" + level  + "] " + msg + "\n";
	fs.appendFile(logPath(), msg, (err: Error): void => {})
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
