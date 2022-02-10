/// <reference path="./References.d.ts"/>
import Config from "./Config";
import * as GlobalTypes from "./types/GlobalTypes";

export interface Callback {
	(): void;
}

let callbacks: Set<Callback> = new Set<Callback>();

export function save(): Promise<void> {
	return Config.save();
}

export function light(): void {
	Config.theme = "light";
	document.body.className = "";
	callbacks.forEach((callback: Callback): void => {
		callback();
	})
}

export function dark(): void {
	Config.theme = "dark";
	document.body.className = "bp3-dark";
	callbacks.forEach((callback: Callback): void => {
		callback();
	})
}

export function toggle(): void {
	if (Config.theme === "light") {
		dark()
	} else {
		light();
	}
}

export function theme(): string {
	return Config.theme;
}

export function editorTheme(): string {
	if (Config.theme === "light") {
		return "eclipse";
	} else {
		return "dracula";
	}
}

export function addChangeListener(callback: Callback): void {
	callbacks.add(callback);
}

export function removeChangeListener(callback: () => void): void {
	callbacks.delete(callback);
}
