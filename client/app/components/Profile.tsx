/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as Theme from "../Theme";
import ProfilesStore from '../stores/ProfilesStore';
import * as ProfileTypes from '../types/ProfileTypes';
import * as ProfileActions from '../actions/ProfileActions';
import PageInfo from './PageInfo';
import PageSwitch from './PageSwitch';
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/theme-eclipse";

interface Props {
	profile: ProfileTypes.ProfileRo;
}

interface State {
	profile: ProfileTypes.Profile;
	message: string;
	disabled: boolean;
	changed: boolean;
	settings: boolean;
	value: string;
}

const css = {
	message: {
		margin: '0 0 6px 0',
	} as React.CSSProperties,
	label: {
		marginBottom: '0',
	} as React.CSSProperties,
	card: {
		margin: '8px',
	} as React.CSSProperties,
	progress: {
		width: '100%',
		height: '4px',
		borderRadius: 0,
	} as React.CSSProperties,
	progressBar: {
		width: '50%',
		borderRadius: 0,
	} as React.CSSProperties,
	button: {
		marginRight: '10px',
	} as React.CSSProperties,
	buttons: {
		flexShrink: 0,
	} as React.CSSProperties,
	editor: {
		margin: '10px 0 0 0',
	} as React.CSSProperties,
};

export default class Profile extends React.Component<Props, State> {
	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			profile: null,
			message: '',
			disabled: false,
			changed: false,
			settings: false,
			value: 'test',
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

	formatedHosts(prfl: ProfileTypes.Profile): string[] {
		let hosts: string[] = [];

		for (let hostAddr of prfl.sync_hosts) {
			let url = new URL(hostAddr);
			hosts.push(url.hostname + (url.port ? (':' + url.port) : ''));
		}

		return hosts;
	}

	render(): JSX.Element {
		let profile: ProfileTypes.Profile = this.state.profile ||
			this.props.profile;

		let syncHosts = this.formatedHosts(profile);
		syncHosts.push('Last Sync: 11/22/3333 11:22');

		return <div className="bp3-card" style={css.card}>
			<div className="layout horizontal">
				<PageInfo
					style={css.label}
					fields={[
						{
							label: 'User',
							value: profile.user || '-',
						},
						{
							label: 'Organization',
							value: profile.organization || '-',
						},
					]}
				/>
				<PageInfo
					style={css.label}
					fields={[
						{
							label: 'Status',
							value: 'Disconnected',
						},
						{
							label: 'Server',
							value: profile.server || '-',
						},
					]}
				/>
			</div>
			<PageInfo
				fields={[
					{
						label: 'Server Address',
						value: '2001:19f0:ac01:1920:ec4:7aff:fe8f:6961',
						copy: true,
					},
					{
						label: 'Client Address',
						value: '2001:19f0:ac01:1920:ec4:7aff:fe8f:6961',
						copy: true,
					},
					{
						label: 'Configuration Sync Hosts',
						value: syncHosts,
					},
				]}
			/>
			<div>
				<PageSwitch
					label="Autostart"
					help="Automatically start profile with system service. Autostart profiles will run for all users."
					hidden={!this.state.settings}
					checked={!!profile.system}
					onToggle={(): void => {
					}}
				/>
			</div>
			<div style={css.message} hidden={!this.state.message}>
				{this.state.message}
			</div>
			<div className="layout horizontal">
				<div style={css.buttons}>
					<button
						className="bp3-button bp3-intent-success bp3-icon-link"
						style={css.button}
						type="button"
						disabled={this.state.disabled}
						onClick={(): void => {

						}}
					>
						Connect
					</button>
					<button
						className="bp3-button bp3-icon-cog"
						style={css.button}
						type="button"
						disabled={this.state.disabled}
						onClick={(): void => {

						}}
					>
						Settings
					</button>
				</div>
			</div>
			<label
				className="bp3-label"
				style={css.editor}
			>
				Profile Output
				<AceEditor
					name={profile.id + "-logs"}
					theme={Theme.editorTheme()}
					height="400px"
					width="100%"
					mode="text"
					fontSize="10px"
					showPrintMargin={false}
					showGutter={true}
					defaultValue={"todo"}
					editorProps={{
						$blockScrolling: true,
					}}
					setOptions={{
						showFoldWidgets: false,
					}}
					onChange={(value: string) => {
						this.setState({
							...this.state,
							value: value,
						})
					}}
				/>
			</label>
		</div>;
	}
}
