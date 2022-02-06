/// <reference path="../References.d.ts"/>
export const ADD = 'loading.add';
export const DONE = 'loading.done';

export interface LoadingDispatch {
	type: string;
	data?: {
		id?: string;
	};
}
