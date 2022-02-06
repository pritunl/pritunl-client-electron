/// <reference path="./References.d.ts"/>
import * as Constants from './Constants';
import util from "util";

export class BaseError extends Error {
	module: string;

	constructor(name: string, ...args: any[]) {
		super();

		let message: string;
		if (args.length > 1) {
			message = util.format.apply(this, args);
		} else {
			message = args[0];
		}

		let messageSpl = message.split(': ');
		this.module = messageSpl[0];

		this.name = name;
		this.message = message;
	}
}

export class ReadError extends BaseError {
	constructor(...args: any[]) {
		super('ReadError', ...args);
	}
}
