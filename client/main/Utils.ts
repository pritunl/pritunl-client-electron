import electron from "electron"
import process from "process";
import childprocess from "child_process";

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
