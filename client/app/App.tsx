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
