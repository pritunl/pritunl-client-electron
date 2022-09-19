/// <reference path="../References.d.ts"/>
import * as Constants from "../Constants";
import * as Auth from "../Auth";
import * as Request from "../Request"
import * as Paths from "../Paths"
import * as MiscUtils from "./MiscUtils"
import * as RequestUtils from "./RequestUtils"
import * as Errors from "../Errors"
import * as Logger from "../Logger"

export async function readServiceLog(): Promise<string> {
	let logData = ""

	try {
		let resp = await RequestUtils
			.get('/log/service')
			.end()
		logData = resp.data
	} catch (err) {
		err = new Errors.RequestError(
			err, "Logs: Service log request error")
		Logger.errorAlert2(err, 10)
	}

	return logData
}

export async function clearServiceLog(): Promise<void> {
	try {
		await RequestUtils
			.del('/log/service')
			.end()
	} catch (err) {
		err = new Errors.RequestError(
			err, "Logs: Service log request error")
		Logger.errorAlert2(err, 10)
	}
}

export async function readClientLog(): Promise<string> {
	let logData = ""
	let logPath = Paths.log()

	try {
		let exists = await MiscUtils.fileExists(logPath)
		if (exists) {
			logData = await MiscUtils.fileRead(logPath)
		}
	} catch(err) {
		Logger.errorAlert2(err, 10)
	}

	return logData
}

export async function clearClientLog(): Promise<void> {
	try {
		await MiscUtils.fileWrite(Paths.log(), "")
	} catch(err) {
		Logger.errorAlert2(err, 10)
	}
}
