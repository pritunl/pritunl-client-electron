/// <reference path="../References.d.ts"/>
import * as ProfileTypes from "../types/ProfileTypes"
import * as RequestUtils from "../utils/RequestUtils"
import * as Errors from "../Errors";
import * as Logger from "../Logger";
import * as Request from "../Request"
import Loader from "../Loader"

export function connect(prfl: ProfileTypes.ProfileData,
	noLoading?: boolean): Promise<void> {
	let loader: Loader
	if (!noLoading) {
		loader = new Loader().loading()
	}

	return new Promise<void>((resolve): void => {
		RequestUtils
			.post('/profile')
			.set('Accept', 'application/json')
			.send(prfl)
			.end()
			.then((resp: Request.Response) => {
				if (loader) {
					loader.done()
				}

				resolve()
			}, (err) => {
				if (loader) {
					loader.done()
				}

				err = new Errors.RequestError(err,
					"Profiles: Profile connect failed")
				Logger.errorAlert(err)

				resolve()
				return
			})
	})
}

export function disconnect(prfl: ProfileTypes.ProfileData,
	noLoading?: boolean): Promise<void> {
	let loader: Loader
	if (!noLoading) {
		loader = new Loader().loading()
	}

	return new Promise<void>((resolve): void => {
		RequestUtils
			.del('/profile/' + prfl.id)
			.end()
			.then((resp: Request.Response) => {
				if (loader) {
					loader.done()
				}

				resolve()
			}, (err) => {
				if (loader) {
					loader.done()
				}

				err = new Errors.RequestError(err,
					"Profiles: Profile disconnect failed")
				Logger.errorAlert(err)

				resolve()
				return
			})
	})
}
