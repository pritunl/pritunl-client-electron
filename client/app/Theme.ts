/// <reference path="./References.d.ts"/>
import Config from "./Config";

export function save(): Promise<void> {
	return Config.save();
}

export function light(): void {
	Config.theme = "light";
	document.body.className = "";
}

export function dark(): void {
	Config.theme = "dark";
	document.body.className = "bp3-dark";
}

export function toggle(): void {
	if (Config.theme === "light") {
		dark()
	} else {
		light();
	}
}
