/// <reference path="../References.d.ts"/>
import Dispatcher from '../dispatcher/Dispatcher';
import EventEmitter from '../EventEmitter';
import * as LoadingTypes from '../types/LoadingTypes';
import * as GlobalTypes from '../types/GlobalTypes';

class LoadingStore extends EventEmitter {
	_loaders: Set<string> = new Set();
	_token = Dispatcher.register((this._callback).bind(this));

	get loading(): boolean {
		return !!this._loaders.size;
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

	_add(id: string): void {
		this._loaders.add(id);
		this.emitChange();
	}

	_done(id: string): void {
		this._loaders.delete(id);
		this.emitChange();
	}

	_callback(action: LoadingTypes.LoadingDispatch): void {
		switch (action.type) {
			case LoadingTypes.ADD:
				this._add(action.data.id);
				break;

			case LoadingTypes.DONE:
				this._done(action.data.id);
				break;
		}
	}
}

export default new LoadingStore();
