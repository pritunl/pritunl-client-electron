/// <reference path="./References.d.ts"/>
import * as React from "react"
import * as Blueprint from "@blueprintjs/core"

const maxToasts = 3

let toaster: Blueprint.Toaster;
let toaster2: Blueprint.Toaster;

export interface Callback {
	(toasts: number): void;
}

let callbacks: Set<Callback> = new Set<Callback>();

let observer = new MutationObserver((): void => {
	let len = 0
	if (toaster2) {
		let toasts = toaster2.getToasts()
		if (toasts) {
			len = toasts.length
		}
	}

	callbacks.forEach((callback: Callback): void => {
		callback(len);
	})
})

function clean(): void {
	let toasts = toaster.getToasts()
	if (toasts.length > maxToasts - 1) {
		toaster.dismiss(toasts[toasts.length - 1].key)
		clean()
	}
}

function clean2(): void {
	let toasts = toaster2.getToasts()
	if (toasts.length > maxToasts - 1) {
		toaster2.dismiss(toasts[toasts.length - 1].key)
		clean2()
	}
}

export function success(message: React.ReactNode, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 5000;
	} else {
		timeout = timeout * 1000;
	}

	clean()

	return toaster.show({
		intent: Blueprint.Intent.SUCCESS,
		message: message,
		timeout: timeout,
	});
}

export function info(message: React.ReactNode, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 5000;
	} else {
		timeout = timeout * 1000;
	}

	clean()

	return toaster.show({
		intent: Blueprint.Intent.PRIMARY,
		message: message,
		timeout: timeout,
	});
}

export function warning(message: React.ReactNode, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 5000;
	} else {
		timeout = timeout * 1000;
	}

	clean()

	return toaster.show({
		intent: Blueprint.Intent.WARNING,
		message: message,
		timeout: timeout,
	});
}

export function error(message: React.ReactNode, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 10000;
	} else {
		timeout = timeout * 1000;
	}

	clean()

	return toaster.show({
		intent: Blueprint.Intent.DANGER,
		message: message,
		timeout: timeout,
	});
}

export function error2(message: React.ReactNode, timeout?: number): string {
	if (timeout === undefined) {
		timeout = 10000;
	} else {
		timeout = timeout * 1000;
	}

	clean2()

	return toaster2.show({
		intent: Blueprint.Intent.DANGER,
		message: message,
		timeout: timeout,
	});
}

export function clearAlert(): void {
	let toasts = toaster.getToasts()
	for (let toast of toasts) {
		toaster2.dismiss(toast.key)
	}
}

export function clearAlert2(): void {
	let toasts = toaster2.getToasts()
	for (let toast of toasts) {
		toaster2.dismiss(toast.key)
	}
}

export function dismiss(key: string) {
	toaster.dismiss(key);
}

export function init() {
	if (!toaster) {
		if (Blueprint.Toaster) {
			toaster = Blueprint.Toaster.create({
				position: Blueprint.Position.BOTTOM,
			}, document.getElementById("toaster"));
		} else {
			console.error("Failed to load toaster")
		}
	}
	if (!toaster2) {
		let elmt = document.getElementById("toaster2")

		if (Blueprint.Toaster) {
			elmt.style.display = "none"
			toaster2 = Blueprint.Toaster.create({
				position: Blueprint.Position.TOP,
			}, elmt);
		} else {
			console.error("Failed to load toaster2")
		}

		observer.observe(elmt, {
			childList: true,
			subtree: true,
		})
	}
}

export function addChangeListener(callback: Callback): void {
	callbacks.add(callback);
}

export function removeChangeListener(
	callback: (toasts: number) => void): void {

	callbacks.delete(callback);
}
