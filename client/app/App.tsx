/// <reference path="References.d.ts"/>
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Blueprint from '@blueprintjs/core';
import Main from './components/Main';
import * as Alert from './Alert';
import * as Event from './Event';
import * as Auth from './Auth';
import * as Constants from './Constants';

Blueprint.FocusStyleManager.onlyShowFocusOnTabs();

Constants.load();
Auth.load();
Alert.init();
Event.init();

ReactDOM.render(
	<div><Main/></div>,
	document.getElementById('app'),
);
