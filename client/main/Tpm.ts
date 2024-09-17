import path from "path"
import childprocess from "child_process"
import * as Logger from "./Logger"
import * as Errors from "./Errors"
import * as Request from "./Request"
import * as RequestUtils from './RequestUtils'
import * as Auth from "./Auth"
import process from "process";

let deviceAuthPath = path.join("/", "Applications", "Pritunl.app",
	"Contents", "Resources", "Pritunl Device Authentication")
if (process.argv.indexOf("--dev") !== -1) {
	deviceAuthPath = path.join(__dirname, "..", "..", "..",
		"service_macos", "Pritunl Device Authentication");
}

let procs: {[key: string]: childprocess.ChildProcess} = {}

export function open(callerId: string, privKey64: string): void {
	let proc = childprocess.execFile(deviceAuthPath)
	let stderr = ""

	setTimeout(() => {
		if (proc.exitCode === null) {
			let err = new Errors.ProcessError(
				null,
				"Tpm: Secure enclave process timed out",
				{
					caller_id: callerId,
				},
			)
			Logger.error(err)
		}
		proc.kill("SIGINT")
	}, 10000)

	proc.on("error", (err) => {
		err = new Errors.ProcessError(
			err,
			"Tpm: Secure enclave exec error",
			{
				caller_id: callerId,
			},
		)
		Logger.error(err)

		RequestUtils
			.post("/tpm/callback")
			.set("Auth-Token", Auth.token)
			.set("User-Agent", "pritunl")
			.send({
				id: callerId,
				error: err.message,
			})
			.end()
			.then((resp: Request.Response) => {
				if (resp.status != 200) {
					err = new Errors.RequestError(
						null,
						"Tpm: Callback request error",
						{
							caller_id: callerId,
							reponse_status: resp.status,
							data: resp.data,
						},
					)
					Logger.error(err)
				}
			}, (err) => {
				err = new Errors.RequestError(
					err,
					"Tpm: Callback request error",
					{
						caller_id: callerId,
					},
				)
				Logger.error(err)
			})
	})

	proc.on("exit", (code: number, signal: string) => {
		delete procs[callerId]

		if (code !== 0) {
			let err = new Errors.ProcessError(
				null,
				"Tpm: Secure enclave exec code error",
				{
					caller_id: callerId,
					exit_code: code,
					output: stderr,
				},
			)
			Logger.error(err)

			RequestUtils
				.post("/tpm/callback")
				.set("Auth-Token", Auth.token)
				.set("User-Agent", "pritunl")
				.send({
					id: callerId,
					error: err.message,
				})
				.end()
				.then((resp: Request.Response) => {
					if (resp.status != 200) {
						err = new Errors.RequestError(
							null,
							"Tpm: Callback request error",
							{
								caller_id: callerId,
								reponse_status: resp.status,
								data: resp.data,
							},
						)
						Logger.error(err)
					}
				}, (err) => {
					err = new Errors.RequestError(
						err,
						"Tpm: Callback request error",
						{
							caller_id: callerId,
						},
					)
					Logger.error(err)
				})
		}
	})

	let outBuffer = ""
	proc.stdout.on("data", (data) => {
		outBuffer += data
		if (!outBuffer.includes("\n")) {
			return
		}
		let lines = outBuffer.split("\n")
		let line = lines[0]
		outBuffer = lines.slice(1).join("\n")

		let dataObj: {[key: string]: any}
		try {
			dataObj = JSON.parse(line.replace(/\s/g, ""))
		} catch {
			let err = new Errors.RequestError(
				null,
				"Tpm: Failed to parse line",
				{
					caller_id: callerId,
					line: data,
				},
			)
			Logger.error(err)
			return
		}

		RequestUtils
			.post("/tpm/callback")
			.set("Auth-Token", Auth.token)
			.set("User-Agent", "pritunl")
			.send({
				id: callerId,
				public_key: dataObj.public_key,
				private_key: dataObj.key_data,
				signature: dataObj.signature,
			})
			.end()
			.then((resp: Request.Response) => {
				if (resp.status != 200) {
					let err = new Errors.RequestError(
						null,
						"Tpm: Callback request error",
						{
							caller_id: callerId,
							reponse_status: resp.status,
							data: resp.data,
						},
					)
					Logger.error(err)
				}
			}, (err) => {
				err = new Errors.RequestError(
					err,
					"Tpm: Callback request error",
					{
						caller_id: callerId,
					},
				)
				Logger.error(err)
			})
	})

	proc.stderr.on("data", (data) => {
		stderr += data
	})

	proc.stdin.write(JSON.stringify({
		"key_data": privKey64,
	}) + "\n")

	procs[callerId] = proc
}

export function sign(callerId: string, signData: string): void {
	let proc = procs[callerId]
	if (!proc) {
		return
	}

	proc.stdin.write(JSON.stringify({
		"sign_data": signData,
	}) + "\n")
}

export function close(callerId: string): void {
	let proc = procs[callerId]
	if (!proc) {
		return
	}

	proc.kill("SIGINT")
}
