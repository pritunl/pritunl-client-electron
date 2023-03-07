/// <reference path="References.d.ts"/>
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Blueprint from "@blueprintjs/core";
import Main from "./components/Main";
import * as Alert from "./Alert";
import * as Event from "./Event";
import * as Auth from "./Auth";
import * as Theme from "./Theme";
import * as Constants from "./Constants";
import Config from "./Config";
import * as Errors from "./Errors";
import * as Logger from "./Logger";

window.onerror = (event, source, line, col, err): void => {
	err = new Errors.UnknownError(err, "Main: Unhandled exception", {
		event: event,
		source: source,
		line: line,
		column: col,
	})
	Logger.errorAlert(err)
}

window.onunhandledrejection = (event): void => {
	let message = ""
	let stack = ""

	try {
		message = event.reason.message
	} catch {
		message = event.reason
	}

	try {
		stack = event.reason.stack
	} catch {
	}

	let err = new Errors.UnknownError(null, "Main: Unhandled rejection", {
		message: message,
		stack: stack,
	})
	Logger.errorAlert(err)
}

Blueprint.FocusStyleManager.onlyShowFocusOnTabs();
Alert.init();

Config.load().then((): void => {
	if (Config.theme === "light") {
		Theme.light();
	} else {
		Theme.dark();
	}

	Constants.load();
	Auth.load();
	Event.init();

	ReactDOM.render(
		<div><Main/></div>,
		document.getElementById("app"),
	);
});
