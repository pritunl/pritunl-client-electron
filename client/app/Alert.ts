/// <reference path="./References.d.ts"/>
import * as Blueprint from "@blueprintjs/core";

let toaster: Blueprint.IToaster;

export function success(message: string, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 5000;
	} else {
		timeout = timeout * 1000;
	}

	return toaster.show({
		intent: Blueprint.Intent.SUCCESS,
		message: message,
		timeout: timeout,
	});
}

export function info(message: string, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 5000;
	} else {
		timeout = timeout * 1000;
	}

	return toaster.show({
		intent: Blueprint.Intent.PRIMARY,
		message: message,
		timeout: timeout,
	});
}

export function warning(message: string, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 5000;
	} else {
		timeout = timeout * 1000;
	}

	return toaster.show({
		intent: Blueprint.Intent.WARNING,
		message: message,
		timeout: timeout,
	});
}

export function error(message: string, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 10000;
	} else {
		timeout = timeout * 1000;
	}

	return toaster.show({
		intent: Blueprint.Intent.DANGER,
		message: message,
		timeout: timeout,
	});
}

export function dismiss(key: string) {
	toaster.dismiss(key);
}

export function init() {
	if (toaster) {
		return;
	}

	if (Blueprint.Toaster) {
		toaster = Blueprint.Toaster.create({
			position: Blueprint.Position.BOTTOM,
		}, document.getElementById("toaster"));
	} else {
		console.error("Failed to load toaster")
	}
}
