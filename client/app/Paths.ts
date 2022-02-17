/// <reference path="./References.d.ts"/>
import * as Constants from './Constants';
import path from "path";

export function log(): string {
	return path.join(Constants.dataPath, "pritunl.log");
}

export function config(): string {
	return path.join(Constants.dataPath, "pritunl.json");
}

export function profiles(): string {
	return path.join(Constants.dataPath, "profiles");
}
