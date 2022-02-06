/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as ReactRouter from 'react-router-dom';
import * as Theme from '../Theme';
import * as Constants from '../Constants';
import LoadingBar from './LoadingBar';

interface State {
	disabled: boolean;
}

const css = {
	card: {
		minWidth: '310px',
		maxWidth: '380px',
		width: 'calc(100% - 20px)',
		margin: '60px auto',
	} as React.CSSProperties,
	nav: {
		overflowX: 'auto',
		overflowY: 'auto',
		userSelect: 'none',
		height: 'auto',
	} as React.CSSProperties,
	navTitle: {
		flexWrap: 'wrap',
		height: 'auto',
	} as React.CSSProperties,
	navGroup: {
		flexWrap: 'wrap',
		height: 'auto',
		padding: '10px 0',
	} as React.CSSProperties,
	link: {
		padding: '0 7px',
		color: 'inherit',
	} as React.CSSProperties,
	sub: {
		color: 'inherit',
	} as React.CSSProperties,
	heading: {
		marginRight: '11px',
		fontSize: '18px',
		fontWeight: 'bold',
	} as React.CSSProperties,
};

export default class Main extends React.Component<{}, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			disabled: false,
		};
	}

	componentDidMount(): void {
	}

	componentWillUnmount(): void {
	}

	render(): JSX.Element {
		return <ReactRouter.HashRouter>
			<div>
				<LoadingBar intent="primary"/>
				<button
					className="bp3-button bp3-minimal bp3-icon-moon"
					onClick={(): void => {
						Theme.toggle();
						Theme.save();
					}}
				/>
				<ReactRouter.Route path="/" exact={true} render={() => (
					<div>home</div>
				)}/>
				<ReactRouter.Route path="/reload" render={() => (
					<ReactRouter.Redirect to="/"/>
				)}/>
				<ReactRouter.Route path="/test" render={() => (
					<div>test</div>
				)}/>
			</div>
		</ReactRouter.HashRouter>;
	}
}
