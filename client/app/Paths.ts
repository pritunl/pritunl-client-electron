/// <reference path="./References.d.ts"/>
import * as Constants from './Constants';
import path from "path";

export function logPath(): string {
	return path.join(Constants.dataPath, "pritunl.json");
}

export function configPath(): string {
	return path.join(Constants.dataPath, "pritunl.json");
}
