/// <reference path="./References.d.ts"/>
import * as SuperAgent from "superagent";

export class BaseError extends Error {
	constructor(name: string, wrapErr: Error, message: string,
		args?: {[key: string]: any}) {

		super()

		if (args) {
			for (let key in args) {
				message += " " + key + "=" + args[key]
			}
		}

		if (wrapErr) {
			message += '\n' + wrapErr
		}

		this.name = name
		this.message = message
		if (wrapErr) {
			this.stack = wrapErr.stack
		}
	}
}

export class ReadError extends BaseError {
	constructor(wrapErr: Error, message: string, args?: {[key: string]: any}) {
		super("ReadError", wrapErr, message, args)
	}
}

export class WriteError extends BaseError {
	constructor(wrapErr: Error, message: string, args?: {[key: string]: any}) {
		super("WriteError", wrapErr, message, args)
	}
}

export class RequestError extends BaseError {
	constructor(wrapErr: Error, res: SuperAgent.Response,
		message: string, args?: {[key: string]: any}) {

		try {
			message = res.body.error_msg || message
		} catch(err) {
		}

		super("RequestError", wrapErr, message, args)
	}
}
