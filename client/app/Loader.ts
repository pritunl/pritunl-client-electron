/// <reference path="./References.d.ts"/>
import Dispatcher from './dispatcher/Dispatcher';
import * as LoadingTypes from './types/LoadingTypes';
import * as MiscUtils from './utils/MiscUtils';

export default class Loader {
	_id: string;

	constructor() {
		this._id = MiscUtils.uuid();
	}

	loading(): Loader {
		Dispatcher.dispatch({
			type: LoadingTypes.ADD,
			data: {
				id: this._id,
			},
		});
		return this;
	}

	done(): Loader {
		Dispatcher.dispatch({
			type: LoadingTypes.DONE,
			data: {
				id: this._id,
			},
		});
		return this;
	}
}
