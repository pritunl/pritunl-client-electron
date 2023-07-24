/// <reference path="../References.d.ts"/>
export const SYNC = 'config.sync';
export const CHANGE = 'config.change';

export interface Config {
	disable_dns_watch?: boolean
	disable_wake_watch?: boolean
	disable_net_clean?: boolean
	enable_wg_dns?: boolean
	interface_metric?: number
}

export type ConfigRo = Readonly<Config>;

export interface ConfigDispatch {
	type: string;
	data?: Config;
}
