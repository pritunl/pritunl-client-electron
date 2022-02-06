/// <reference path="./References.d.ts"/>
import EventDispatcher from './dispatcher/EventDispatcher';
import * as Csrf from './Csrf';

let connected = false;

function connect(): void {
	let url = '';
	let location = window.location;

	if (location.protocol === 'https:') {
		url += 'wss';
	} else {
		url += 'ws';
	}

	url += '://' + location.host + '/event?csrf_token=' + Csrf.token;

	let socket = new WebSocket(url);

	socket.addEventListener('close', () => {
		setTimeout(() => {
			connect();
		}, 500);
	});

	socket.addEventListener('message', (evt) => {
		console.log(JSON.parse(evt.data).data);
		EventDispatcher.dispatch(JSON.parse(evt.data).data);
	});
}

export function init() {
	if (connected) {
		return;
	}
	connected = true;

	connect();
}
