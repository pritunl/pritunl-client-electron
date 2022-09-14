/// <reference path="../References.d.ts"/>
import * as Constants from "../Constants";
import * as Auth from "../Auth";
import * as Request from "../Request"
import * as MiscUtils from "./MiscUtils"
import crypto from "crypto";

export function get(path: string): Request.Request {
	let req = new Request.Request()

	if (Constants.unix) {
		req.unix(Constants.unixPath)
	} else {
		req.tcp(Constants.webHost)
	}

	req.get(path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function put(path: string): Request.Request {
	let req = new Request.Request()

	if (Constants.unix) {
		req.unix(Constants.unixPath)
	} else {
		req.tcp(Constants.webHost)
	}

	req.put(path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function post(path: string): Request.Request {
	let req = new Request.Request()

	if (Constants.unix) {
		req.unix(Constants.unixPath)
	} else {
		req.tcp(Constants.webHost)
	}

	req.post(path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function del(path: string): Request.Request {
	let req = new Request.Request()

	if (Constants.unix) {
		req.unix(Constants.unixPath)
	} else {
		req.tcp(Constants.webHost)
	}

	req.delete(path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	return req
}

export function authGet(host: string, path: string,
	token: string, secret: string): Request.Request {

	let req = new Request.Request()

	req.get(host + path)
		.set("Auth-Token", Auth.token)
		.set("User-Agent", "pritunl")

	let authTimestamp = Math.floor(new Date().getTime() / 1000).toString()
	let authNonce = MiscUtils.nonce()
	let authString = [token, authTimestamp, authNonce, "get", path].join("&")
	let authSignature = crypto.createHmac("sha512", secret).update(
		authString).digest("base64")

	req.secure(false)
		.set("Auth-Token", token)
		.set("Auth-Timestamp", authTimestamp)
		.set("Auth-Nonce", authNonce)
		.set("Auth-Signature", authSignature)

	return req

}
