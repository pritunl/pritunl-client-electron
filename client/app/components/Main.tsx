/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as Theme from '../Theme';
import * as ProfileActions from '../actions/ProfileActions';
import LoadingBar from './LoadingBar';
import Profiles from './Profiles';

interface State {
	path: string;
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
			path: "/",
			disabled: false,
		};
	}

	componentDidMount(): void {
		Theme.addChangeListener(this.onChange);
	}

	componentWillUnmount(): void {
		Theme.removeChangeListener(this.onChange);
	}

	onChange = (): void => {
		this.setState({
			...this.state,
		});
	}

	render(): JSX.Element {
		let themeIcon = ""
		if (Theme.theme() === "dark") {
			themeIcon = "bp3-icon-flash"
		} else {
			themeIcon = "bp3-icon-moon"
		}

		let page: JSX.Element;
		switch (this.state.path) {
			case "/":
				page = <Profiles/>
				break
			case "/profiles":
				page = <Profiles/>
				break
		}

		return <div style={css.container} className="layout vertical">
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
					<div
						className="bp3-button bp3-minimal bp3-icon-people"
						style={css.link}
					>
						Profiles
					</div>
					<div>
						<button
							className="bp3-button bp3-minimal bp3-icon-refresh"
							disabled={this.state.disabled}
							onClick={() => {
								let pathname = "";

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
					</div>
					<div>
						<button
							className={"bp3-button bp3-minimal " + themeIcon}
							onClick={(): void => {
								Theme.toggle();
								Theme.save();
							}}
						/>
					</div>
				</div>
			</nav>
			<div className="flex" style={css.content}>
				{page}
			</div>
		</div>
	}
}
