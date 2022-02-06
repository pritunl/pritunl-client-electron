/// <reference path="../References.d.ts"/>
export const CHANGE = 'change';
export const RESET = 'reset';
export const RELOAD = 'reload';

export interface Dispatch {
	type: string;
	data?: any;
}
