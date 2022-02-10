/// <reference path="./References.d.ts"/>

export class BaseError extends Error {
	constructor(name: string, ...args: any[]) {
		super();

		let message: string;
		let wrapErr: Error;
		if (args[0] instanceof Error) {
			wrapErr = args.shift();
		}

		if (args.length > 0) {
			message = args.shift();
		}

		if (wrapErr) {
			message += '\n' + wrapErr;
		}

		this.name = name;
		this.message = message;
		if (wrapErr) {
			this.stack = wrapErr.stack;
		}
	}
}

export class ReadError extends BaseError {
	constructor(...args: any[]) {
		super("ReadError", ...args);
	}
}

export class WriteError extends BaseError {
	constructor(...args: any[]) {
		super("WriteError", ...args);
	}
}

export class RequestError extends BaseError {
	constructor(...args: any[]) {
		super("WriteError", ...args);
	}
}
