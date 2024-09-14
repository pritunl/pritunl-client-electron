export type DispatchToken = string;

var _prefix = 'ID_';

export default class DispatcherBase<TPayload> {
	_callbacks: {[key: DispatchToken]: (payload: TPayload) => void};
	_isDispatching: boolean;
	_isHandled: {[key: DispatchToken]: boolean};
	_isPending: {[key: DispatchToken]: boolean};
	_lastID: number;
	_pendingPayload: TPayload;

	constructor() {
		this._callbacks = {};
		this._isDispatching = false;
		this._isHandled = {};
		this._isPending = {};
		this._lastID = 1;
	}

	register(callback: (payload: TPayload) => void): DispatchToken {
		var id = _prefix + this._lastID++;
		this._callbacks[id] = callback;
		return id;
	}

	unregister(id: DispatchToken): void {
		console.error(
			this._callbacks[id],
			'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
			id,
		);
		delete this._callbacks[id];
	}

	waitFor(ids: Array<DispatchToken>): void {
		console.error(
			this._isDispatching,
			'Dispatcher.waitFor(...): Must be invoked while dispatching.',
		);
		for (var ii = 0; ii < ids.length; ii++) {
			var id = ids[ii];
			if (this._isPending[id]) {
				console.error(
					this._isHandled[id],
					'Dispatcher.waitFor(...): Circular dependency detected while ' +
					'waiting for `%s`.',
					id,
				);
				continue;
			}
			console.error(
				this._callbacks[id],
				'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
				id,
			);
			this._invokeCallback(id);
		}
	}

	dispatch(payload: TPayload): void {
		// console.error(
		// 	!this._isDispatching,
		// 	'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.',
		// );
		this._startDispatching(payload);
		try {
			for (var id in this._callbacks) {
				if (this._isPending[id]) {
					continue;
				}
				this._invokeCallback(id);
			}
		} finally {
			this._stopDispatching();
		}
	}

	isDispatching(): boolean {
		return this._isDispatching;
	}

	_invokeCallback(id: DispatchToken): void {
		this._isPending[id] = true;
		this._callbacks[id](this._pendingPayload);
		this._isHandled[id] = true;
	}

	_startDispatching(payload: TPayload): void {
		for (var id in this._callbacks) {
			this._isPending[id] = false;
			this._isHandled[id] = false;
		}
		this._pendingPayload = payload;
		this._isDispatching = true;
	}

	_stopDispatching(): void {
		delete this._pendingPayload;
		this._isDispatching = false;
	}
}
