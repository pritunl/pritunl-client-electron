/// <reference path="../References.d.ts"/>
import path from "path"
import * as Constants from "../Constants"

export const SYNC = "profile.sync"
export const SYNC_STATE = "profile.sync_state"
export const SYNC_ALL = "profile.sync_all"
export const TRAVERSE = "profile.traverse"
export const FILTER = "profile.filter"
export const CHANGE = "profile.change"

export interface Profile {
	id?: string
	system?: boolean
	name?: string
	uv_name?: string
	state?: string
	wg?: boolean
	disable_reconnect?: boolean
	last_mode?: string
	organization_id?: string
	organization?: string
	server_id?: string
	server?: string
	user_id?: string
	user?: string
	pre_connect_msg?: string
	password_mode?: string
	token?: boolean
	token_ttl?: number
	sync_hosts?: string[]
	sync_hash?: string
	sync_secret?: string
	sync_token?: string
	server_public_key?: string[]
	server_box_public_key?: string
	status?: string
	timestamp?: number
	server_addr?: string
	client_addr?: string

	formattedName(): string
	formattedUptime(): string
	formatedHosts(): string[]
	confPath(): string
	dataPath(): string
}

export interface Filter {
	id?: string;
	name?: string;
}

export type Profiles = Profile[];
export type ProfilesMap = {[key: string]: Profile}

export type ProfileRo = Readonly<Profile>;
export type ProfilesRo = ReadonlyArray<ProfileRo>;

export interface ProfileDispatch {
	type: string;
	data?: {
		id?: string;
		profile?: Profile;
		profiles?: Profiles;
		profilesState?: ProfilesMap;
		page?: number;
		pageCount?: number;
		filter?: Filter;
		count?: number;
	};
}

export interface ProfileData {
	id?: string;
	mode?: string;
	org_id?: string;
	user_id?: string;
	server_id?: string;
	sync_hosts?: string[];
	sync_token?: string;
	sync_secret?: string;
	username?: string;
	password?: string;
	server_public_key?: string;
	server_box_public_key?: string;
	token_ttl?: number;
	reconnect?: boolean;
	timeout?: boolean;
	data?: string;
}

export function New(data: Profile): Profile {
	data.formattedName = function(): string {
		return this.server + " (" + this.user + ")"
	}

	data.formattedUptime = function(): string {
		if (!this.timestamp || this.status !== 'connected') {
			return '';
		}

		let  curTime = Math.floor((new Date).getTime() / 1000);

		let uptime = curTime - this.timestamp;
		let units: number;
		let unitStr: string;
		let uptimeItems: string[] =[];

		if (uptime > 86400) {
			units = Math.floor(uptime / 86400);
			uptime -= units * 86400;
			unitStr = units + ' day';
			if (units > 1) {
				unitStr += 's';
			}
			uptimeItems.push(unitStr);
		}

		if (uptime > 3600) {
			units = Math.floor(uptime / 3600);
			uptime -= units * 3600;
			unitStr = units + ' hour';
			if (units > 1) {
				unitStr += 's';
			}
			uptimeItems.push(unitStr);
		}

		if (uptime > 60) {
			units = Math.floor(uptime / 60);
			uptime -= units * 60;
			unitStr = units + ' min';
			if (units > 1) {
				unitStr += 's';
			}
			uptimeItems.push(unitStr);
		}

		if (uptime) {
			unitStr = uptime + ' sec';
			if (uptime > 1) {
				unitStr += 's';
			}
			uptimeItems.push(unitStr);
		}

		return uptimeItems.join(' ');
	}

	data.formatedHosts = function(): string[] {
		let hosts: string[] = [];

		for (let hostAddr of this.sync_hosts) {
			let url = new URL(hostAddr);
			hosts.push(url.hostname + (url.port ? (':' + url.port) : ''));
		}

		return hosts;
	}

	data.confPath = function(): string {
		return path.join(Constants.dataPath, "profiles", this.id + ".conf")
	}

	data.dataPath = function(): string {
		return path.join(Constants.dataPath, "profiles", this.id + ".ovpn")
	}

	return data;
}
