/// <reference path="../References.d.ts"/>
export const SYNC = 'profile.sync';
export const TRAVERSE = 'profile.traverse';
export const FILTER = 'profile.filter';
export const CHANGE = 'profile.change';

export interface Profile {
	id?: string;
	system?: boolean;
	name?: string;
	uv_name?: string;
	state?: string;
	wg?: boolean;
	disable_reconnect?: boolean;
	last_mode?: string;
	organization_id?: string;
	organization?: string;
	server_id?: string;
	server?: string;
	user_id?: string;
	user?: string;
	pre_connect_msg?: string;
	password_mode?: string;
	token?: boolean;
	token_ttl?: number;
	sync_hosts?: string[];
	sync_hash?: string;
	sync_secret?: string;
	sync_token?: string;
	server_public_key?: string[];
	server_box_public_key?: string;
}



export interface Filter {
	id?: string;
	name?: string;
}

export type Profiles = Profile[];

export type ProfileRo = Readonly<Profile>;
export type ProfilesRo = ReadonlyArray<ProfileRo>;

export interface ProfileDispatch {
	type: string;
	data?: {
		id?: string;
		profile?: Profile;
		profiles?: Profiles;
		page?: number;
		pageCount?: number;
		filter?: Filter;
		count?: number;
	};
}
