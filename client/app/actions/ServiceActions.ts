/// <reference path="../References.d.ts"/>
import * as SuperAgent from 'superagent';
import * as Auth from "../Auth";
import * as Constants from '../Constants';
import * as ProfileTypes from '../types/ProfileTypes';
import Dispatcher from '../dispatcher/Dispatcher';
import EventDispatcher from '../dispatcher/EventDispatcher';
import * as Alert from '../Alert';
import * as Paths from '../Paths';
import Loader from '../Loader';
import * as MiscUtils from '../utils/MiscUtils';

export function connect(prfl: ProfileTypes.ProfileData,
		noLoading?: boolean): Promise<void> {
	let loader: Loader;
	if (!noLoading) {
		loader = new Loader().loading();
	}

	return new Promise<void>((resolve, reject): void => {
		let req = SuperAgent
			.post('/profile')
			.send(prfl)
			.set('Accept', 'application/json')
			.set('User-Agent', 'pritunl')
			.set('Auth-Token', Auth.token);

		if (Constants.unix) {
			req.set('Host', 'unix');
		}

		req.end((err: any, res: SuperAgent.Response): void => {
				if (loader) {
					loader.done();
				}

				if (res && res.status === 401) {
					window.location.href = '/login';
					resolve();
					return;
				}

				if (err) {
					Alert.errorRes(res, 'Profile connect failed');
					reject(err);
					return;
				}

				resolve();
			});
	});
}
