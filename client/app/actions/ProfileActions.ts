/// <reference path="../References.d.ts"/>
import Dispatcher from '../dispatcher/Dispatcher';
import EventDispatcher from '../dispatcher/EventDispatcher';
import * as Alert from '../Alert';
import * as Paths from '../Paths';
import Loader from '../Loader';
import * as ProfileTypes from '../types/ProfileTypes';
import ProfilesStore from '../stores/ProfilesStore';
import * as MiscUtils from '../utils/MiscUtils';
import * as RequestUtils from '../utils/RequestUtils';
import fs from "fs";
import path from "path";
import * as Errors from "../Errors";
import * as Logger from "../Logger";
import * as Request from "../Request"
import os from "os";

let syncId: string;

function loadSystemProfiles(): Promise<ProfileTypes.Profiles> {
	return new Promise<ProfileTypes.Profiles>((resolve): void => {
		RequestUtils
			.get('/sprofile')
			.set('Accept', 'application/json')
			.end()
			.then((resp: Request.Response) => {
				resolve(resp.json() as ProfileTypes.Profiles)
			}, (err) => {
				err = new Errors.RequestError(err,
					"Profiles: Service load error")
				Logger.errorAlert(err.message)
				resolve([])
				return
			})
	})
}

function loadProfile(prflId: string,
		prflPath: string): Promise<ProfileTypes.Profile> {

	let ovpnPath = prflPath.substring(0, prflPath.length-5) + ".ovpn"
	let logPath = prflPath.substring(0, prflPath.length-5) + ".log"

	return new Promise<ProfileTypes.Profile>((resolve, reject): void => {
		if (os.platform() !== "win32") {
			fs.stat(
				prflPath,
				function(err: NodeJS.ErrnoException, stats: fs.Stats) {
					if (err && err.code === "ENOENT") {
						return
					}

					let mode: string
					try {
						mode = (stats.mode & 0o777).toString(8);
					} catch (err) {
						err = new Errors.ReadError(
							err, "Profiles: Failed to stat profile",
							{profile_path: prflPath})
						Logger.errorAlert(err.message)
						return
					}
					if (mode !== "600") {
						fs.chmod(prflPath, 0o600, function(err) {
							if (err) {
								err = new Errors.ReadError(
									err, "Profiles: Failed to stat profile",
									{profile_path: prflPath})
								Logger.errorAlert(err.message)
							}
						});
					}
				},
			);
			fs.stat(
				ovpnPath,
				function(err: NodeJS.ErrnoException, stats: fs.Stats) {
					if (err && err.code === "ENOENT") {
						return
					}

					let mode: string
					try {
						mode = (stats.mode & 0o777).toString(8);
					} catch (err) {
						err = new Errors.ReadError(
							err, "Profiles: Failed to stat profile ovpn",
							{profile_ovpn_path: ovpnPath})
						Logger.errorAlert(err.message)
						return
					}

					if (mode !== "600") {
						fs.chmod(ovpnPath, 0o600, function(err) {
							if (err) {
								err = new Errors.ReadError(
									err, "Profiles: Failed to stat profile ovpn",
									{profile_ovpn_path: ovpnPath})
								Logger.errorAlert(err.message)
							}
						});
					}
				},
			);
			fs.stat(
				logPath,
				function(err: NodeJS.ErrnoException, stats: fs.Stats) {
					if (err && err.code === "ENOENT") {
						return
					}

					let mode: string
					try {
						mode = (stats.mode & 0o777).toString(8);
					} catch (err) {
						err = new Errors.ReadError(
							err, "Profiles: Failed to stat profile log",
							{profile_log_path: logPath})
						Logger.errorAlert(err.message)
						return
					}

					if (mode !== "600") {
						fs.chmod(logPath, 0o600, function(err) {
							if (err) {
								err = new Errors.ReadError(
									err, "Profiles: Failed to stat profile log",
									{profile_log_path: logPath})
								Logger.errorAlert(err.message)
							}
						});
					}
				},
			);
		}

		fs.readFile(
			prflPath, "utf-8",
			(err: NodeJS.ErrnoException, data: string): void => {
				if (err) {
					err = new Errors.ReadError(
						err, "Profiles: Failed to read profile",
						{profile_log_path: logPath})
					reject(err)
					return
				}

				let prfl: ProfileTypes.Profile = JSON.parse(data)
				prfl.id = prflId

				fs.readFile(
					ovpnPath, "utf-8",
					(err: NodeJS.ErrnoException, data: string): void => {
						if (err) {
							err = new Errors.ReadError(
								err, "Profiles: Failed to read profile",
								{profile_log_path: logPath})
							reject(err)
							return
						}

						prfl.ovpn_data = data

						resolve(prfl)
					},
				)
			},
		)
	});
}

function loadProfiles(): Promise<ProfileTypes.Profiles> {
	return new Promise<ProfileTypes.Profiles>((resolve): void => {
		let profilesPath = Paths.profiles();

		fs.stat(
			profilesPath,
			(err: NodeJS.ErrnoException, stats: fs.Stats): void => {
				if (err) {
					if (err.code !== "ENOENT") {
						err = new Errors.ReadError(err, "Profiles: Read error");
						Logger.errorAlert(err.message);
					}

					resolve([]);
					return;
				}

				fs.readdir(
					profilesPath,
					async (err: NodeJS.ErrnoException, filenames: string[]) => {
						if (err) {
							err = new Errors.ReadError(err, "Profiles: Read error");
							Logger.errorAlert(err.message);

							resolve([]);
							return;
						}

						let prfls: ProfileTypes.Profiles = [];
						for (let filename of filenames) {
							if (!filename.endsWith('.conf')) {
								continue;
							}

							let prflPath = path.join(profilesPath, filename);
							let prflId = filename.split(".")[0]

							let prfl: ProfileTypes.Profile;
							try {
								prfl = await loadProfile(prflId, prflPath);
							} catch(err) {
								Logger.error(err.message || err)
							}

							if (prfl) {
								prfls.push(prfl);
							}
						}

						resolve(prfls);
						return;
					},
				);
			},
		);
	});
}

function loadProfilesState(): Promise<ProfileTypes.ProfilesMap> {
	return new Promise<ProfileTypes.ProfilesMap>((resolve): void => {
		RequestUtils
			.get('/profile')
			.set('Accept', 'application/json')
			.end()
			.then((resp: Request.Response) => {
				resolve(resp.json() as ProfileTypes.ProfilesMap)
			}, (err) => {
				err = new Errors.RequestError(err,
					"Profiles: Status error")
				Logger.errorAlert(err.message)
				resolve({})
				return
			})
	});
}

export function sync(noLoading?: boolean): Promise<void> {
	let curSyncId = MiscUtils.uuid();
	syncId = curSyncId;

	let loader: Loader;
	if (!noLoading) {
		loader = new Loader().loading();
	}

	return new Promise<void>((resolve, reject): void => {
		loadProfiles().then((prfls: ProfileTypes.Profiles): void => {
			if (loader) {
				loader.done();
			}

			if (curSyncId !== syncId) {
				resolve();
				return;
			}

			loadSystemProfiles().then((systemPrfls: ProfileTypes.Profiles) => {
				loadProfilesState().then((prflsState: ProfileTypes.ProfilesMap) => {
					Dispatcher.dispatch({
						type: ProfileTypes.SYNC_ALL,
						data: {
							profiles: prfls,
							profilesState: prflsState,
							profilesSystem: systemPrfls,
							count: prfls.length,
						},
					});

					resolve();
				})
			})
		});
	});
}

export function loadData(prfl: ProfileTypes.Profile): Promise<string> {
	return new Promise<string>((resolve): void => {
		let profilePath = prfl.dataPath()

		fs.readFile(
			profilePath, "utf-8",
			(err: NodeJS.ErrnoException, data: string): void => {
				if (err) {
					err = new Errors.ReadError(
						err, "Profiles: Profile read error")
					Logger.errorAlert(err.message, 10)

					resolve("")
					return
				}

				resolve(data)
			},
		)
	})
}

export function traverse(page: number): Promise<void> {
	Dispatcher.dispatch({
		type: ProfileTypes.TRAVERSE,
		data: {
			page: page,
		},
	});

	return sync();
}

export function filter(filt: ProfileTypes.Filter): Promise<void> {
	Dispatcher.dispatch({
		type: ProfileTypes.FILTER,
		data: {
			filter: filt,
		},
	});

	return sync();
}

export function commit(prfl: ProfileTypes.Profile): Promise<void> {
	if (prfl.system) {
		return commitSystem(prfl)
	} else {
		return commitConf(prfl)
	}
}

function commitConf(prfl: ProfileTypes.Profile): Promise<void> {
	return new Promise<void>((resolve): void => {
		let profilePath = prfl.confPath()

		fs.writeFile(
			profilePath, prfl.exportConf(),
			(err: NodeJS.ErrnoException): void => {
				if (err) {
					err = new Errors.ReadError(
						err, "Profiles: Profile read error")
					Logger.errorAlert(err.message, 10)

					resolve()
					return
				}

				resolve()

				sync()
			},
		)
	})
}

function commitSystem(prfl: ProfileTypes.Profile): Promise<void> {
	let loader = new Loader().loading();

	return new Promise<void>((resolve, reject): void => {
		RequestUtils
			.put('/sprofile')
			.set('Accept', 'application/json')
			.send(prfl.exportSystem())
			.end()
			.then((resp: Request.Response) => {
				loader.done()

				resolve()
				sync()
			}, (err) => {
				loader.done()

				err = new Errors.RequestError(err,
					"Profiles: Failed to save profile")
				Logger.errorAlert(err.message)
				reject(err)
				return
			})
	})
}

EventDispatcher.register((action: ProfileTypes.ProfileDispatch) => {
	if (action.type === "update") {
		sync();
	}
});
