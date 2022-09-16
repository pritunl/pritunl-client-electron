/// <reference path="../References.d.ts"/>
import * as Constants from "../Constants"
import * as Auth from "../Auth"
import * as MiscUtils from "../utils/MiscUtils"
import * as Request from "../Request"
import * as RequestUtils from "../utils/RequestUtils"
import * as ProfileActions from "../actions/ProfileActions"
import * as ServiceActions from "../actions/ServiceActions"
import * as Errors from "../Errors"
import * as Logger from "../Logger"
import path from "path"
import util from "util"
import crypto from "crypto"
import fs from "fs"

export const SYNC = "profile.sync"
export const SYNC_STATE = "profile.sync_state"
export const SYNC_ALL = "profile.sync_all"
export const TRAVERSE = "profile.traverse"
export const FILTER = "profile.filter"
export const CHANGE = "profile.change"

export interface Profile {
	id?: string
	system?: boolean
	name?: string
	uv_name?: string
	state?: boolean
	wg?: boolean
	disabled?: boolean
	last_mode?: string
	organization_id?: string
	organization?: string
	server_id?: string
	server?: string
	user_id?: string
	user?: string
	pre_connect_msg?: string
	disable_reconnect?: boolean
	dynamic_firewall?: boolean
	password_mode?: string
	token?: boolean
	token_ttl?: number
	sync_hosts?: string[]
	sync_hash?: string
	sync_secret?: string
	sync_token?: string
	server_public_key?: string[]
	server_box_public_key?: string
	sync_time?: number
	status?: string
	timestamp?: number
	server_addr?: string
	client_addr?: string
	ovpn_data?: string

	formattedName(): string
	formattedStatus(): string
	formattedUptime(): string
	formatedHosts(): string[]
	authTypes(): string[]
	confPath(): string
	dataPath(): string
	extractKey(data: string): Promise<string>
	exportConf(): string
	importConf(data: Profile): void
	exportSystem(): string
	convertSystem(): Promise<void>
	convertUser(): Promise<void>
	writeConf(): Promise<void>
	upsertConf(data: Profile): void
	readData(): Promise<string>
	writeData(data: string): Promise<void>
	readLog(): Promise<string>
	clearLog(): Promise<void>
	delete(): Promise<void>
	getAuthType(data: string): string
	_importSync(data: string): Promise<void>
	_sync(syncHost: string): Promise<string>
	sync(): Promise<void>
}

export interface Filter {
	id?: string
	name?: string
}

export type Profiles = Profile[]
export type ProfilesMap = {[key: string]: Profile}

export type ProfileRo = Profile
export type ProfilesRo = Profile[]

export interface ProfileDispatch {
	type: string
	data?: {
		id?: string
		profile?: Profile
		profiles?: Profiles
		profilesSystem?: Profiles
		profilesState?: ProfilesMap
		page?: number
		pageCount?: number
		filter?: Filter
		count?: number
	}
}

export interface ProfileData {
	id?: string
	mode?: string
	org_id?: string
	user_id?: string
	server_id?: string
	sync_hosts?: string[]
	sync_token?: string
	sync_secret?: string
	username?: string
	password?: string
	dynamic_firewall?: boolean
	server_public_key?: string
	server_box_public_key?: string
	token_ttl?: number
	reconnect?: boolean
	timeout?: boolean
	data?: string
}

export function New(self: Profile): Profile {
	self.formattedName = function(): string {
		if (this.name) {
			return this.name
		}
		return this.server + " (" + this.user + ")"
	}

	self.formattedStatus = function(): string {
		if (!this.status) {
			if (this.system && this.state) {
				return "Connecting"
			}
			return "Disconnected"
		}

		switch (this.status) {
			case "connected":
				return "Connected"
			case "connecting":
				return "Connecting"
			case "reconnecting":
				return "Reconnecting"
			case "disconnecting":
				if (this.system && this.state) {
					return "Reconnecting"
				}
				return "Disconnecting"
			default:
				return this.status
		}
	}

	self.formattedUptime = function(): string {
		if (!this.timestamp || this.status !== "connected") {
			return ""
		}

		let curTime = Math.floor((new Date).getTime() / 1000)

		let uptime = curTime - this.timestamp
		let units: number
		let unitStr: string
		let uptimeItems: string[] = []
		let hasDays = false

		if (uptime > 86400) {
			hasDays = true
			units = Math.floor(uptime / 86400)
			uptime -= units * 86400
			unitStr = units + " day"
			if (units > 1) {
				unitStr += "s"
			}
			uptimeItems.push(unitStr)
		}

		if (uptime > 3600) {
			units = Math.floor(uptime / 3600)
			uptime -= units * 3600
			unitStr = units + " hour"
			if (units > 1) {
				unitStr += "s"
			}
			uptimeItems.push(unitStr)
		}

		if (uptime > 60) {
			units = Math.floor(uptime / 60)
			uptime -= units * 60
			unitStr = units + " min"
			if (units > 1) {
				unitStr += "s"
			}
			uptimeItems.push(unitStr)
		}

		if (uptime && !hasDays) {
			unitStr = uptime + " sec"
			if (uptime > 1) {
				unitStr += "s"
			}
			uptimeItems.push(unitStr)
		}

		return uptimeItems.join(" ")
	}

	self.formatedHosts = function(): string[] {
		let hosts: string[] = []

		for (let hostAddr of (this.sync_hosts || [])) {
			let url = new URL(hostAddr)
			hosts.push(url.hostname + (url.port ? (":" + url.port) : ""))
		}

		return hosts
	}

	self.authTypes = function(): string[] {
		let passwordMode = this.password_mode
		if (!passwordMode && this.ovpn_data &&
			this.ovpn_data.indexOf("auth-user-pass") !== -1) {

			if (this.user) {
				passwordMode = "otp"
			} else {
				passwordMode = "username_password"
			}
		}

		return passwordMode.split("_")
	}

	self.confPath = function(): string {
		return path.join(Constants.dataPath, "profiles", this.id + ".conf")
	}

	self.dataPath = function(): string {
		return path.join(Constants.dataPath, "profiles", this.id + ".ovpn")
	}

	self.extractKey = async function(data: string): Promise<string> {
		let sIndex: number
		let eIndex: number
		let keyData = ""

		if (Constants.platform !== "darwin") {
			return data
		}

		sIndex = data.indexOf("<tls-auth>")
		eIndex = data.indexOf("</tls-auth>\n")
		if (sIndex > 0 && eIndex > 0) {
			keyData += data.substring(sIndex, eIndex + 12)
			data = data.substring(0, sIndex) + data.substring(
				eIndex + 12, data.length)
		}

		sIndex = data.indexOf("<key>")
		eIndex = data.indexOf("</key>\n")
		if (sIndex > 0 &&  eIndex > 0) {
			keyData += data.substring(sIndex, eIndex + 7)
			data = data.substring(0, sIndex) + data.substring(
				eIndex + 7, data.length)
		}

		if (!keyData) {
			return data
		}

		let keyData64 = new Buffer(keyData).toString("base64");

		await MiscUtils.exec(
			"/usr/bin/security",
			"delete-generic-password",
			"-s", "pritunl",
			"-a", this.id,
		)

		await MiscUtils.exec(
			"/usr/bin/security",
			"add-generic-password",
			"-U",
			"-s", "pritunl",
			"-a", this.id,
			"-w", keyData64.toString(),
		)

		return data
	}

	self.exportConf = function(): string {
		return JSON.stringify({
			name: this.name,
			wg: this.wg,
			last_mode: this.last_mode,
			organization_id: this.organization_id,
			organization: this.organization,
			server_id: this.server_id,
			server: this.server,
			user_id: this.user_id,
			user: this.user,
			pre_connect_msg: this.pre_connect_msg,
			dynamic_firewall: this.dynamic_firewall,
			password_mode: this.password_mode,
			token: this.token,
			token_ttl: this.token_ttl,
			disable_reconnect: this.disable_reconnect,
			disabled: this.disabled,
			sync_time: this.sync_time,
			sync_hosts: this.sync_hosts,
			sync_hash: this.sync_hash,
			sync_secret: this.sync_secret,
			sync_token: this.sync_token,
			server_public_key: this.server_public_key,
			server_box_public_key: this.server_box_public_key,
		})
	}

	self.importConf = function(data: Profile): void {
		this.name = data.name
		this.wg = data.wg
		this.organization_id = data.organization_id
		this.organization = data.organization
		this.server_id = data.server_id
		this.server = data.server
		this.user_id = data.user_id
		this.user = data.user
		this.pre_connect_msg = data.pre_connect_msg
		this.dynamic_firewall = data.dynamic_firewall
		this.password_mode = data.password_mode
		this.token = data.token
		this.token_ttl = data.token_ttl
		this.disable_reconnect = data.disable_reconnect
		this.sync_time = data.sync_time
		this.sync_hosts = data.sync_hosts || []
		this.sync_hash = data.sync_hash
		this.sync_secret = data.sync_secret
		this.sync_token = data.sync_token
		this.server_public_key = data.server_public_key
		this.server_box_public_key = data.server_box_public_key
	}

	self.exportSystem = function(): any {
		return {
			id: this.id,
			name: this.name,
			wg: this.wg,
			last_mode: this.last_mode,
			organization_id: this.organization_id,
			organization: this.organization,
			server_id: this.server_id,
			server: this.server,
			user_id: this.user_id,
			user: this.user,
			pre_connect_msg: this.pre_connect_msg,
			dynamic_firewall: this.dynamic_firewall,
			password_mode: this.password_mode,
			token: this.token,
			token_ttl: this.token_ttl,
			disable_reconnect: this.disable_reconnect,
			disabled: this.disabled,
			sync_time: this.sync_time,
			sync_hosts: this.sync_hosts,
			sync_hash: this.sync_hash,
			sync_secret: this.sync_secret,
			sync_token: this.sync_token,
			server_public_key: this.server_public_key,
			server_box_public_key: this.server_box_public_key,
			ovpn_data: this.ovpn_data,
		}
	}

	self.upsertConf = function(data: Profile): void {
		this.name = data.name || this.name
		this.wg = data.wg || false
		this.organization_id = data.organization_id || this.organization_id
		this.organization = data.organization || this.organization
		this.server_id = data.server_id || this.server_id
		this.server = data.server || this.server
		this.user_id = data.user_id || this.user_id
		this.user = data.user || this.user
		this.pre_connect_msg = data.pre_connect_msg
		this.dynamic_firewall = data.dynamic_firewall
		this.password_mode = data.password_mode
		this.token = data.token
		this.token_ttl = data.token_ttl
		this.disable_reconnect = data.disable_reconnect
		this.sync_hosts = data.sync_hosts
		this.sync_hash = data.sync_hash
		this.server_public_key = data.server_public_key
		this.server_box_public_key = data.server_box_public_key
	}

	self.convertSystem = async function(): Promise<void> {
		if (this.system) {
			return
		}

		try {
			await ServiceActions.disconnect(this)
		} catch {}

		this.ovpn_data = await this.readData()

		try {
			await RequestUtils
				.put('/sprofile')
				.set('Accept', 'application/json')
				.send(this.exportSystem())
				.end()
		} catch (err) {
			err = new Errors.RequestError(err,
				"Profiles: Failed to save system profile")
			Logger.errorAlert(err)
			ProfileActions.sync()
			return
		}

		await this.delete()

		ProfileActions.sync()
	}

	self.convertUser = async function(): Promise<void> {
		if (!this.system) {
			return
		}

		try {
			await ServiceActions.disconnect(this)
		} catch {}

		try {
			await RequestUtils
				.del('/sprofile/' + this.id)
				.set('Accept', 'application/json')
				.end()
		} catch (err) {
			err = new Errors.RequestError(err,
				"Profiles: Failed to delete system profile")
			Logger.errorAlert(err)
			ProfileActions.sync()
			return
		}

		this.system = false
		await this.writeConf()
		await this.writeData(this.ovpn_data)

		this.ovpn_data = ""

		ProfileActions.sync()
	}

	self.writeConf = function(): Promise<void> {
		if (this.system) {
			return new Promise<void>((resolve): void => {
				RequestUtils
					.put('/sprofile')
					.set('Accept', 'application/json')
					.send(this.exportSystem())
					.end()
					.then((resp: Request.Response) => {
						resolve()
						ProfileActions.sync()
					}, (err) => {
						err = new Errors.RequestError(err,
							"Profiles: Failed to save system profile")
						Logger.errorAlert(err)
						resolve()
						return
					})
			})
		}

		return new Promise<void>((resolve): void => {
			let profilePath = this.confPath()

			fs.writeFile(
				profilePath, this.exportConf(),
				(err: NodeJS.ErrnoException): void => {
					if (err) {
						err = new Errors.ReadError(
							err, "Profiles: Profile write error",
							{profile_path: profilePath})
						Logger.errorAlert(err, 10)

						resolve()
						return
					}

					resolve()
				},
			)
		})
	}

	self.readData = async function(): Promise<string> {
		if (this.system) {
			return this.ovpn_data
		}

		let data = ""
		try {
			data = await MiscUtils.fileRead(this.dataPath())
		} catch (err) {
			Logger.errorAlert(err)
			return ""
		}

		if (Constants.platform === "darwin") {
			let resp = await MiscUtils.exec(
				"/usr/bin/security",
				"find-generic-password",
				"-w",
				"-s", "pritunl",
				"-a", this.id,
			)

			if (resp.error) {
				let err = new Errors.ReadError(resp.error,
					"Profiles: Failed to get key from keychain")
				Logger.errorAlert(err)
				return ""
			}

			data += new Buffer(
				resp.stdout.replace("\n", ""),
				"base64",
			).toString()
		}

		return data
	}

	self.writeData = function(data: string): Promise<void> {
		if (this.system) {
			this.ovpn_data = data

			return new Promise<void>((resolve, reject): void => {
				RequestUtils
					.put('/sprofile')
					.set('Accept', 'application/json')
					.send(this.exportSystem())
					.end()
					.then((resp: Request.Response) => {
						resolve()
						ProfileActions.sync()
					}, (err) => {
						err = new Errors.RequestError(err,
							"Profiles: Failed to save system profile")
						Logger.errorAlert(err)
						resolve()
						return
					})
			})
		}

		return new Promise<void>((resolve): void => {
			let profilePath = this.dataPath()

			this.extractKey(data).then((newData: string): void => {
				fs.writeFile(
					profilePath, newData,
					(err: NodeJS.ErrnoException): void => {
						if (err) {
							err = new Errors.WriteError(
								err, "Profiles: Profile write error",
								{profile_path: profilePath})
							Logger.errorAlert(err, 10)

							resolve()
							return
						}

						resolve()
					},
				)
			})
		})
	}

	self.readLog = async function(): Promise<string> {
		let logData = ""

		try {
			let resp = await RequestUtils
				.get('/log/' + this.id)
				.end()
			logData = resp.data
		} catch (err) {
			err = new Errors.RequestError(
				err, "Profiles: Profile log request error")
			Logger.errorAlert(err, 10)
		}

		return logData
	}

	self.clearLog = async function(): Promise<void> {
		try {
			await RequestUtils
				.del('/log/' + this.id)
				.end()
		} catch (err) {
			err = new Errors.RequestError(
				err, "Profiles: Profile log request error")
			Logger.errorAlert(err, 10)
		}
	}

	self.delete = async function(): Promise<void> {
		try {
			await ServiceActions.disconnect(this)
		} catch {
		}

		if (this.system) {
			try {
				await RequestUtils
					.del('/sprofile/' + this.id)
					.set('Accept', 'application/json')
					.end()
			} catch (err) {
				Logger.errorAlert(err, 10)
			}
		}

		if (Constants.platform === "darwin") {
			await MiscUtils.exec(
				"/usr/bin/security",
				"delete-generic-password",
				"-s", "pritunl",
				"-a", this.id,
			)
		}

		try {
			await MiscUtils.fileDelete(this.confPath())
		} catch {}
		try {
			await MiscUtils.fileDelete(this.dataPath())
		} catch {}
	}

	self._importSync = async function(data: string): Promise<void> {
		let sIndex
		let eIndex
		let tlsAuth = ""
		let cert = ""
		let key = ""
		let jsonData = ""
		let jsonFound = null

		let origData = await this.readData()

		let dataLines = origData.split("\n")
		let line
		let uvId
		let uvName
		for (let i = 0; i < dataLines.length; i++) {
			line = dataLines[i]

			if (line.startsWith("setenv UV_ID ")) {
				uvId = line
			} else if (line.startsWith("setenv UV_NAME ")) {
				uvName = line
			}
		}

		dataLines = data.split("\n")
		data = ""
		for (let i = 0; i < dataLines.length; i++) {
			line = dataLines[i]

			if (jsonFound === null && line === "#{") {
				jsonFound = true
			}

			if (jsonFound === true && line.startsWith("#")) {
				if (line === "#}") {
					jsonFound = false
				}
				jsonData += line.replace("#", "")
			} else {
				if (line.startsWith("setenv UV_ID ")) {
					line = uvId
				} else if (line.startsWith("setenv UV_NAME ")) {
					line = uvName
				}

				data += line + '\n'
			}
		}

		let confData
		try {
			confData = JSON.parse(jsonData)
		} catch {
		}

		if (confData) {
			this.sync_time = Math.round(Date.now() / 1000)
			this.upsertConf(confData);
			await this.writeConf();
		}

		let curData = ""
		try {
			curData = await this.readData()
		} catch (err) {
			Logger.error(err)
			return
		}

		if (curData.indexOf("key-direction") >= 0 && data.indexOf(
				"key-direction") < 0) {
			tlsAuth += "key-direction 1\n"
		}

		sIndex = curData.indexOf("<tls-auth>")
		eIndex = curData.indexOf("</tls-auth>")
		if (sIndex >= 0 &&  eIndex >= 0) {
			tlsAuth += curData.substring(sIndex, eIndex + 11) + "\n"
		}

		sIndex = curData.indexOf("<cert>")
		eIndex = curData.indexOf("</cert>")
		if (sIndex >= 0 && eIndex >= 0) {
			cert = curData.substring(sIndex, eIndex + 7) + "\n"
		}

		sIndex = curData.indexOf("<key>")
		eIndex = curData.indexOf("</key>")
		if (sIndex >= 0 && eIndex >= 0) {
			key = curData.substring(sIndex, eIndex + 6) + "\n"
		}

		try {
			await this.writeData(data + tlsAuth + cert + key)
		} catch (err) {
		 Logger.error(err)
			return
		}
	}

	self._sync = function(syncHost: string): Promise<string> {
		return new Promise<string>((resolve, reject): void => {
			let path = util.format(
				'/key/sync/%s/%s/%s/%s',
				this.organization_id,
				this.user_id,
				this.server_id,
				this.sync_hash,
			)

			let authTimestamp = Math.floor(new Date().getTime() / 1000).toString()
			let authNonce = MiscUtils.nonce()
			let authString = [this.sync_token, authTimestamp,
				authNonce, "GET", path].join("&")
			let authSignature = crypto.createHmac("sha512",
				this.sync_secret).update(authString).digest("base64")

			let req = new Request.Request()

			req.get(path)
				.tcp(syncHost)
				.timeout(5)
				.secure(false)
				.set("Auth-Token", Auth.token)
				.set("User-Agent", "pritunl")
				.set("Auth-Token", this.sync_token)
				.set("Auth-Timestamp", authTimestamp)
				.set("Auth-Nonce", authNonce)
				.set("Auth-Signature", authSignature)
				.end()
				.then((resp: Request.Response) => {
					if (resp.status !== 200) {
						let err: Errors.RequestError
						switch (resp.status) {
							case 480:
								Logger.info(
									"Profiles: Skipping profile sync, requires subscription")
								break
							case 404:
								err = new Errors.RequestError(null,
									"Profiles: Failed to sync profile, user not found")
								reject(err)
								return
							case 401:
								err = new Errors.RequestError(null,
									"Profiles: Failed to sync profile, authentication failed")
								reject(err)
								return
							default:
								err = new Errors.RequestError(null,
									"Profiles: Failed to sync profile, status: " + resp.status)
								reject(err)
								return
						}
						resolve("")
						return
					}

					let syncData: any
					try {
						syncData = resp.json()
					} catch(err) {
						reject(err)
						return
					}

					if (!syncData.signature || !syncData.conf) {
						resolve("")
						return
					}

					let confSignature = crypto.createHmac(
						"sha512", this.sync_secret).update(
						syncData.conf).digest("base64")

					if (confSignature !== syncData.signature) {
						let err = new Errors.ParseError(null,
							"Profiles: Failed to sync profile, signature invalid")
						reject(err)
						return
					}

					resolve(syncData.conf)
				}, (err) => {
					err = new Errors.RequestError(err,
						"Profiles: Failed to sync profile configuration")
					reject(err)
					return
				})
		})
	}

	self.getAuthType = function(data: string): string {
		if (this.password_mode) {
			return this.password_mode || null;
		}

		let n = data.indexOf("auth-user-pass")

		if (n !== -1) {
			let authStr = this.data.substring(n, this.data.indexOf("\n", n))
			authStr = authStr.split(" ")
			if (authStr.length > 1 && authStr[1]) {
				return null
			}

			if (this.user) {
				return "otp"
			} else {
				return "username_password"
			}
		} else {
			return null
		}
	}

	self.sync = async function(): Promise<void> {
		if (!this.sync_hosts || !this.sync_hosts.length) {
			return
		}

		let syncHosts = MiscUtils.shuffle([...this.sync_hosts])
		let syncData: string
		let syncError: any

		for (let syncHost of syncHosts) {
			try {
				syncData = await this._sync(syncHost)
				syncError = null
				break
			} catch(err) {
				syncError = err
			}
		}

		if (syncError) {
			Logger.error(syncError)
			this.sync_time = -1
			await this.writeConf();
		}

		if (syncData) {
			try {
				await this._importSync(syncData)
			} catch(err) {
				err = new Errors.ParseError(err,
					"Profiles: Failed to parse profile sync",
					{profile_id: this.id})
				Logger.error(err)
				this.sync_time = -1
				await this.writeConf();
			}
		}
	}

	return self
}
