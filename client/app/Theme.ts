/// <reference path="./References.d.ts"/>
import * as Config from './Config';

export function save(): Promise<void> {
	return Config.save();
}

export function light(): void {
	Config.setTheme('light');
	document.body.className = '';
}

export function dark(): void {
	Config.setTheme('dark');
	document.body.className = 'bp3-dark';
}

export function toggle(): void {
	if (Config.theme === 'light') {
		dark()
	} else {
		light();
	}
}
