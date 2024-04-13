import * as Auth from "./Auth";
import * as Request from "./Request"
import crypto from "crypto";

export function get(path: string): Request.Request {
	let req = new Request.Request()

	if (Auth.unix) {
		req.unix(Auth.unixPath)
	} else {
		req.tcp(Auth.webHost)
	}

	req.get(path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function put(path: string): Request.Request {
	let req = new Request.Request()

	if (Auth.unix) {
		req.unix(Auth.unixPath)
	} else {
		req.tcp(Auth.webHost)
	}

	req.put(path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function post(path: string): Request.Request {
	let req = new Request.Request()

	if (Auth.unix) {
		req.unix(Auth.unixPath)
	} else {
		req.tcp(Auth.webHost)
	}

	req.post(path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function del(path: string): Request.Request {
	let req = new Request.Request()

	if (Auth.unix) {
		req.unix(Auth.unixPath)
	} else {
		req.tcp(Auth.webHost)
	}

	req.delete(path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}
