/// <reference path="../References.d.ts"/>
import Dispatcher from '../dispatcher/Dispatcher';
import EventEmitter from '../EventEmitter';
import * as ConfigTypes from '../types/ConfigTypes';
import * as GlobalTypes from '../types/GlobalTypes';

class ConfigStore extends EventEmitter {
	_config: ConfigTypes.ConfigRo;
	_token = Dispatcher.register((this._callback).bind(this));

	get config(): ConfigTypes.ConfigRo {
		return this._config || {};
	}

	get configM(): ConfigTypes.Config {
		if (this._config) {
			return {
				...this._config || {},
			};
		}
		return undefined;
	}

	emitChange(): void {
		this.emitDefer(GlobalTypes.CHANGE);
	}

	addChangeListener(callback: () => void): void {
		this.on(GlobalTypes.CHANGE, callback);
	}

	removeChangeListener(callback: () => void): void {
		this.removeListener(GlobalTypes.CHANGE, callback);
	}

	_sync(config: ConfigTypes.Config): void {
		this._config = Object.freeze(config);
		this.emitChange();
	}

	_callback(action: ConfigTypes.ConfigDispatch): void {
		switch (action.type) {
			case ConfigTypes.SYNC:
				this._sync(action.data);
				break;
		}
	}
}

export default new ConfigStore();
