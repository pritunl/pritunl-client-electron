import electron from "electron"
import process from "process";
import childprocess from "child_process";

export function uuid(): string {
	return (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
}

export function uuidRand(): string {
	let id = ""

	for (let i = 0; i < 4; i++) {
		id += Math.floor((1 + Math.random()) * 0x10000).toString(
			16).substring(1);
	}

	return id;
}

export function openLink(url: string): boolean {
	let u = new URL(url)

	if (u.protocol !== "http:" && u.protocol !== "https:") {
		return false
	}
	if (!u.hostname) {
		return false
	}
	if (u.port && Number.isNaN(u.port)) {
		return false
	}

	let urlParsed = u.protocol + "//" + u.hostname
	if (u.port) {
		urlParsed += ":" + u.port
	}
	if (u.pathname) {
		urlParsed += u.pathname
	}
	if (u.search) {
		urlParsed += u.search
	}
	if (u.hash) {
		urlParsed += u.hash
	}

	if (process.platform === "linux") {
		childprocess.execFile(
			"xdg-open", [urlParsed],
			(err) => {
				if (err) {
					electron.shell.openExternal(urlParsed)
				}
			},
		)
	} else {
		electron.shell.openExternal(urlParsed)
	}

	return true
}
