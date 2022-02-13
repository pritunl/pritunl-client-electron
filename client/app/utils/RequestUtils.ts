/// <reference path="../References.d.ts"/>
import * as SuperAgent from "superagent"
import * as Constants from "../Constants";
import * as Auth from "../Auth";

export function get(path: string): SuperAgent.SuperAgentRequest {
	let reqHost = ""
	if (Constants.unix) {
		reqHost = Constants.unixHost
	} else {
		reqHost = Constants.webHost
	}

	let req = SuperAgent
		.get(reqHost + path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function put(path: string): SuperAgent.SuperAgentRequest {
	let reqHost = ""
	if (Constants.unix) {
		reqHost = Constants.unixHost
	} else {
		reqHost = Constants.webHost
	}

	let req = SuperAgent
		.put(reqHost + path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	if (Constants.unix) {
		req.set("Host", "unix")
	}

	return req
}

export function post(path: string): SuperAgent.SuperAgentRequest {
	let reqHost = ""
	if (Constants.unix) {
		reqHost = Constants.unixHost
	} else {
		reqHost = Constants.webHost
	}

	let req = SuperAgent
		.post(reqHost + path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function del(path: string): SuperAgent.SuperAgentRequest {
	let reqHost = ""
	if (Constants.unix) {
		reqHost = Constants.unixHost
	} else {
		reqHost = Constants.webHost
	}

	let req = SuperAgent
		.delete(reqHost + path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}
