/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as ReactRouter from 'react-router-dom';
import * as Theme from '../Theme';
import * as ProfileActions from '../actions/ProfileActions';
import * as Constants from '../Constants';
import LoadingBar from './LoadingBar';
import Profiles from './Profiles';

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
		padding: '0 4px 0 8px',
	} as React.CSSProperties,
	navTitle: {
		flexWrap: 'wrap',
		height: 'auto',
	} as React.CSSProperties,
	navGroup: {
		flexWrap: 'wrap',
		height: 'auto',
		padding: '4px 0',
	} as React.CSSProperties,
	link: {
		padding: '0 7px',
		color: 'inherit',
	} as React.CSSProperties,
	sub: {
		color: 'inherit',
	} as React.CSSProperties,
	heading: {
		fontFamily: "'Fredoka One', cursive",
		marginRight: '11px',
		fontSize: '26px',
	} as React.CSSProperties,
	loading: {
		position: 'absolute',
		width: '100%',
		zIndex: '100',
	} as React.CSSProperties,
	container: {
		height: '100%',
	} as React.CSSProperties,
	content: {
		overflowY: 'auto',
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
			<div style={css.container} className="layout vertical">
				<LoadingBar intent="primary" style={css.loading}/>
				<nav className="bp3-navbar layout horizontal" style={css.nav}>
					<div
						className="bp3-navbar-group bp3-align-left flex"
						style={css.navTitle}
					>
						<div className="bp3-navbar-heading"
								 style={css.heading}
						>pritunl</div>
					</div>
					<div
						className="bp3-navbar-group bp3-align-right"
						style={css.navGroup}
					>
						<ReactRouter.Link
							className="bp3-button bp3-minimal bp3-icon-people"
							style={css.link}
							to="/profiles"
						>
							Profiles
						</ReactRouter.Link>
						<ReactRouter.Route render={(props) => (
							<button
								className="bp3-button bp3-minimal bp3-icon-refresh"
								disabled={this.state.disabled}
								onClick={() => {
									let pathname = props.location.pathname;

									this.setState({
										...this.state,
										disabled: true,
									});

									if (pathname === '/profiles') {
										ProfileActions.sync().then((): void => {
											this.setState({
												...this.state,
												disabled: false,
											});
										}).catch((): void => {
											this.setState({
												...this.state,
												disabled: false,
											});
										});
									} else {
										ProfileActions.sync().then((): void => {
											this.setState({
												...this.state,
												disabled: false,
											});
										}).catch((): void => {
											this.setState({
												...this.state,
												disabled: false,
											});
										});
									}
								}}
							>Refresh</button>
						)}/>
						<button
							className="bp3-button bp3-minimal bp3-icon-moon"
							onClick={(): void => {
								Theme.toggle();
								Theme.save();
							}}
						/>
					</div>
				</nav>
				<div className="flex" style={css.content}>
					<ReactRouter.Route path="/" exact={true} render={() => (
						<Profiles/>
					)}/>
					<ReactRouter.Route path="/reload" render={() => (
						<ReactRouter.Redirect to="/"/>
					)}/>
					<ReactRouter.Route path="/profiles" render={() => (
						<Profiles/>
					)}/>
				</div>
			</div>
		</ReactRouter.HashRouter>;
	}
}
