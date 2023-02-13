/// <reference path="../References.d.ts"/>
import * as RequestUtils from "../utils/RequestUtils"
import Dispatcher from "../dispatcher/Dispatcher"
import EventDispatcher from "../dispatcher/EventDispatcher"
import Loader from "../Loader"
import * as ConfigTypes from "../types/ConfigTypes"
import * as Errors from "../Errors"
import * as Logger from "../Logger"
import * as Request from "../Request"

export function sync(): Promise<void> {
	let loader = new Loader().loading()

	return new Promise<void>((resolve): void => {
		RequestUtils
			.get("/config")
			.set("Accept", "application/json")
			.end()
			.then((resp: Request.Response) => {
				if (loader) {
					loader.done()
				}

				Dispatcher.dispatch({
					type: ConfigTypes.SYNC,
					data: resp.json() as ConfigTypes.Config,
				})

				resolve()
			}, (err) => {
				if (loader) {
					loader.done()
				}

				err = new Errors.RequestError(err,
					"Actions: Config load error")
				Logger.errorAlert(err)

				resolve()
			})
	})
}

export function commit(config: ConfigTypes.Config): Promise<void> {
	let loader = new Loader().loading()

	return new Promise<void>((resolve): void => {
		RequestUtils
			.put("/config")
			.set("Accept", "application/json")
			.send(config)
			.end()
			.then((resp: Request.Response) => {
				if (loader) {
					loader.done()
				}

				resolve()
				sync()
			}, (err) => {
				if (loader) {
					loader.done()
				}

				err = new Errors.RequestError(err,
					"Actions: Config commit failed")
				Logger.errorAlert(err)

				resolve()
				sync()
			})
	})
}

EventDispatcher.register((action: ConfigTypes.ConfigDispatch) => {
	switch (action.type) {
		case ConfigTypes.CHANGE:
			sync()
			break
	}
})
