/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as Electron from "electron";
import * as Theme from '../Theme';
import Config from '../Config';
import * as Constants from '../Constants';
import * as ProfileActions from '../actions/ProfileActions';
import ProfileImport from "./ProfileImport";
import LoadingBar from './LoadingBar';
import Profiles from './Profiles';
import Logs from './Logs';
import * as Blueprint from "@blueprintjs/core";
import * as Alert from "../Alert";

let upgradeShown = false

interface State {
	path: string
	disabled: boolean
	menu: boolean
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
	menuLabel: {
		fontWeight: "bold",
	} as React.CSSProperties,
};

export default class Main extends React.Component<{}, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			path: "/",
			disabled: false,
			menu: false,
		};
	}

	componentDidMount(): void {
		Constants.addChangeListener(this.onChange);
	}

	componentWillUnmount(): void {
		Constants.removeChangeListener(this.onChange);
	}

	onChange = (): void => {
		this.setState({
			...this.state,
		});
	}

	render(): JSX.Element {
		if (Constants.state.upgrade && !upgradeShown) {
			upgradeShown = true
			Alert.info("Update available, download the latest " +
				"release from the Pritunl homepage", 0)
		}

		let themeLabel = ""
		let themeIcon: Blueprint.IconName;
		if (Theme.theme() === "dark") {
			themeLabel = "Light Theme"
			themeIcon = "flash"
		} else {
			themeLabel = "Dark Theme"
			themeIcon = "moon"
		}

		let trayLabel = ""
		if (Config.disable_tray_icon) {
			trayLabel = "Enable Tray Icon"
		} else {
			trayLabel = "Disable Tray Icon"
		}

		let ifaceLabel = ""
		if (Config.classic_interface) {
			ifaceLabel = "Use New Interface"
		} else {
			ifaceLabel = "Use Classic Interface"
		}

		let page: JSX.Element;
		switch (this.state.path) {
			case "/":
				page = <Profiles/>
				break
			case "/profiles":
				page = <Profiles/>
				break
			case "/logs":
				page = <Logs/>
				break
		}

		let version = Constants.state.version
		if (Constants.state.version) {
			version = " v" + Constants.state.version
		}

		let menu: JSX.Element = <Blueprint.Menu>
			<li
				className="bp3-menu-header"
				style={css.menuLabel}
			>{"Pritunl Client" + version}</li>
			<Blueprint.MenuDivider/>
			<Blueprint.MenuItem
				text={themeLabel}
				icon={themeIcon}
				onClick={(): void => {
					Theme.toggle()
					Theme.save()
				}}
			/>
			<Blueprint.MenuItem
				text="Refresh"
				icon="refresh"
				hidden={true}
				disabled={this.state.disabled}
				onClick={(): void => {
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
					} else if (pathname === '/logs') {
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
			/>
			<Blueprint.MenuItem
				text={trayLabel}
				icon="dashboard"
				onClick={async (): Promise<void> => {
					Config.disable_tray_icon = !Config.disable_tray_icon
					await Config.save({
						disable_tray_icon: Config.disable_tray_icon,
					})

					if (Config.disable_tray_icon) {
						Alert.success("Tray icon disabled, restart client " +
							"for configuration to take effect")
					} else {
						Alert.success("Tray icon enabled, restart client " +
							"for configuration to take effect")
					}
				}}
			/>
			<Blueprint.MenuItem
				text={ifaceLabel}
				icon="comparison"
				onClick={async (): Promise<void> => {
					Config.classic_interface = !Config.classic_interface
					await Config.save({
						classic_interface: Config.classic_interface,
					})

					if (Config.classic_interface) {
						Alert.success("Switched to classic interface, restart client " +
							"for configuration to take effect")
					} else {
						Alert.success("Switched to new interface, restart client " +
							"for configuration to take effect")
					}
				}}
			/>
			<Blueprint.MenuItem
				text="Reload App"
				icon="refresh"
				onClick={(): void => {
					Electron.ipcRenderer.send("control", "reload")
				}}
			/>
			<Blueprint.MenuItem
				text="Developer Tools"
				icon="code"
				onClick={(): void => {
					Electron.ipcRenderer.send("control", "dev-tools")
				}}
			/>
		</Blueprint.Menu>

		let menuToggle: JSX.Element = <Blueprint.Button
			minimal={true}
			icon="menu"
		/>

		return <div style={css.container} className="layout vertical">
			<LoadingBar intent="primary" style={css.loading}/>
			<nav
				className="bp3-navbar layout horizontal"
				style={css.nav}
			>
				<div
					className="bp3-navbar-group bp3-align-left flex webkit-drag"
					style={css.navTitle}
				>
					<div
						className="bp3-navbar-heading"
						style={css.heading}
					>pritunl</div>
				</div>
				<div
					className="bp3-navbar-group bp3-align-right"
					style={css.navGroup}
				>
					<button
						className="bp3-button bp3-minimal bp3-icon-people"
						style={css.link}
						onClick={() => {
							this.setState({
								...this.state,
								path: "/profiles",
							})
						}}
					>
						Profiles
					</button>
					<ProfileImport
						style={css.link}
					/>
					<button
						className="bp3-button bp3-minimal bp3-icon-history"
						style={css.link}
						onClick={() => {
							this.setState({
								...this.state,
								path: "/logs",
							})
						}}
					>
						Logs
					</button>
					<div>
						<Blueprint.Popover
							position={Blueprint.Position.BOTTOM}
							content={menu}
							target={menuToggle}
							usePortal={true}
							minimal={true}
						/>
					</div>
					<button
						className="bp3-button bp3-minimal bp3-icon-minus"
						type="button"
						hidden={!Constants.noTitle}
						onClick={(): void => {
							Electron.ipcRenderer.send("control", "minimize")
						}}
					/>
					<button
						className="bp3-button bp3-minimal bp3-icon-cross close-button"
						type="button"
						hidden={!Constants.noTitle}
						onClick={(): void => {
							window.close()
						}}
					/>
				</div>
			</nav>
			<div className="layout vertical flex" style={css.content}>
				{page}
			</div>
		</div>
	}
}
