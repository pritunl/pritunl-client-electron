/// <reference path="../References.d.ts"/>
import * as SuperAgent from "superagent"
import * as ProfileTypes from "../types/ProfileTypes"
import * as Alert from "../Alert"
import * as RequestUtils from "../utils/RequestUtils"
import Loader from "../Loader"

export function connect(prfl: ProfileTypes.ProfileData,
		noLoading?: boolean): Promise<void> {
	let loader: Loader
	if (!noLoading) {
		loader = new Loader().loading()
	}

	return new Promise<void>((resolve, reject): void => {
		RequestUtils
			.post("/profile")
			.send(prfl)
			.set("Accept", "application/json")
			.end((err: any, res: SuperAgent.Response): void => {
				if (loader) {
					loader.done()
				}

				if (err) {
					Alert.errorRes(res, "Profile connect failed")
					reject(err)
					return
				}

				resolve()
			})
	})
}
