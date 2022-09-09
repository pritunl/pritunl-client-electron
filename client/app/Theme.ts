/// <reference path="./References.d.ts"/>
import Config from "./Config";
import * as Constants from "./Constants";
import * as GlobalTypes from "./types/GlobalTypes";

export function save(): Promise<void> {
	return Config.save({
		theme: Config.theme,
	});
}

export function light(): void {
	Config.theme = "light";
	document.body.className = "";
	Constants.triggerChange()
}

export function dark(): void {
	Config.theme = "dark";
	document.body.className = "bp3-dark";
	Constants.triggerChange()
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
