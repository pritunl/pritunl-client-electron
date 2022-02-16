/// <reference path="../References.d.ts"/>
import * as SuperAgent from 'superagent';
import * as Auth from "../Auth";
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
import os from "os";

let syncId: string;

export function sync2(noLoading?: boolean): Promise<void> {
	let curSyncId = MiscUtils.uuid();
	syncId = curSyncId;

	let loader: Loader;
	if (!noLoading) {
		loader = new Loader().loading();
	}

	return new Promise<void>((resolve, reject): void => {
		SuperAgent
			.get('/sprofile')
			.query({
				...ProfilesStore.filter,
				page: ProfilesStore.page,
				page_count: ProfilesStore.pageCount,
			})
			.set('Accept', 'application/json')
			.set('User-Agent', 'pritunl')
			.set('Auth-Token', Auth.token)
			.end((err: any, res: SuperAgent.Response): void => {
				if (loader) {
					loader.done();
				}

				if (res && res.status === 401) {
					window.location.href = '/login';
					resolve();
					return;
				}

				if (curSyncId !== syncId) {
					resolve();
					return;
				}

				if (err) {
					Alert.errorRes(res, 'Failed to load profiles');
					reject(err);
					return;
				}

				Dispatcher.dispatch({
					type: ProfileTypes.SYNC,
					data: {
						profiles: res.body.profiles,
						count: res.body.count,
					},
				});

				resolve();
			});
	});
}

function loadProfile(prflId: string,
		prflPath: string): Promise<ProfileTypes.Profile> {

	return new Promise<ProfileTypes.Profile>((resolve): void => {
		if (os.platform() !== "win32") {
			fs.stat(
				prflId,
				function(err: NodeJS.ErrnoException, stats: fs.Stats) {
					if (err && err.code === "ENOENT") {
						return
					}

					let mode: string
					try {
						mode = (stats.mode & 0o777).toString(8);
					} catch (e) {
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
		}

		fs.readFile(
			prflPath, "utf-8",
			(err: NodeJS.ErrnoException, data: string): void => {
				let prfl: ProfileTypes.Profile = JSON.parse(data)
				prfl.id = prflId
				resolve(prfl)
			},
		);
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

							let prfl = await loadProfile(prflId, prflPath);
							prfls.push(prfl);
						}

						resolve(prfls);
						return;
					},
				);
			},
		);
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

			Dispatcher.dispatch({
				type: ProfileTypes.SYNC,
				data: {
					profiles: prfls,
					count: prfls.length,
				},
			});

			resolve();
			return;
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

export function commit(profile: ProfileTypes.Profile): Promise<void> {
	let loader = new Loader().loading();

	return new Promise<void>((resolve, reject): void => {
		SuperAgent
			.put('/profile/' + profile.id)
			.send(profile)
			.set('Accept', 'application/json')
			.set('User-Agent', 'pritunl')
			.set('Auth-Token', Auth.token)
			.end((err: any, res: SuperAgent.Response): void => {
				loader.done();

				if (res && res.status === 401) {
					window.location.href = '/login';
					resolve();
					return;
				}

				if (err) {
					Alert.errorRes(res, 'Failed to save profile');
					reject(err);
					return;
				}

				resolve();
			});
	});
}

export function create(profile: ProfileTypes.Profile): Promise<void> {
	let loader = new Loader().loading();

	return new Promise<void>((resolve, reject): void => {
		SuperAgent
			.post('/profile')
			.send(profile)
			.set('Accept', 'application/json')
			.set('User-Agent', 'pritunl')
			.set('Auth-Token', Auth.token)
			.end((err: any, res: SuperAgent.Response): void => {
				loader.done();

				if (res && res.status === 401) {
					window.location.href = '/login';
					resolve();
					return;
				}

				if (err) {
					Alert.errorRes(res, 'Failed to create profile');
					reject(err);
					return;
				}

				resolve();
			});
	});
}

export function remove(profileId: string): Promise<void> {
	let loader = new Loader().loading();

	return new Promise<void>((resolve, reject): void => {
		SuperAgent
			.delete('/profile/' + profileId)
			.set('Accept', 'application/json')
			.set('User-Agent', 'pritunl')
			.set('Auth-Token', Auth.token)
			.end((err: any, res: SuperAgent.Response): void => {
				loader.done();

				if (res && res.status === 401) {
					window.location.href = '/login';
					resolve();
					return;
				}

				if (err) {
					Alert.errorRes(res, 'Failed to delete profile');
					reject(err);
					return;
				}

				resolve();
			});
	});
}

export function removeMulti(profileIds: string[]): Promise<void> {
	let loader = new Loader().loading();

	return new Promise<void>((resolve, reject): void => {
		SuperAgent
			.delete('/profile')
			.send(profileIds)
			.set('Accept', 'application/json')
			.set('User-Agent', 'pritunl')
			.set('Auth-Token', Auth.token)
			.end((err: any, res: SuperAgent.Response): void => {
				loader.done();

				if (res && res.status === 401) {
					window.location.href = '/login';
					resolve();
					return;
				}

				if (err) {
					Alert.errorRes(res, 'Failed to delete profiles');
					reject(err);
					return;
				}

				resolve();
			});
	});
}

EventDispatcher.register((action: ProfileTypes.ProfileDispatch) => {
	switch (action.type) {
		case ProfileTypes.CHANGE:
			sync();
			break;
	}
});
