/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as Theme from "../Theme";
import ProfilesStore from '../stores/ProfilesStore';
import * as ProfileTypes from '../types/ProfileTypes';
import * as ProfileActions from '../actions/ProfileActions';
import * as ServiceActions from '../actions/ServiceActions';
import * as Constants from "../Constants";
import * as MiscUtils from "../utils/MiscUtils";
import * as Blueprint from "@blueprintjs/core";
import ConfirmButton from "./ConfirmButton";
import PageInfo from './PageInfo';
import PageSwitch from './PageSwitch';
import ProfileConnect from "./ProfileConnect";
import ProfileSettings from "./ProfileSettings";

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
	labelLast: {
		marginBottom: '-5px',
	} as React.CSSProperties,
	card: {
		position: "relative",
		margin: '8px',
		paddingRight: 0,
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
	deleteButton: {
	} as React.CSSProperties,
	deleteButtonBox: {
		position: "absolute",
		top: "5px",
		right: "5px",
	} as React.CSSProperties,
	buttons: {
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

	onDelete = (): void => {
		this.setState({
			...this.state,
			disabled: true,
		})

		let profile: ProfileTypes.Profile = this.state.profile ||
			this.props.profile

		profile.delete().then((): void => {
			this.setState({
				...this.state,
				disabled: false,
			})
			ProfileActions.sync()
		})
	}

	render(): JSX.Element {
		let profile: ProfileTypes.Profile = this.state.profile ||
			this.props.profile;

		let syncHosts = profile.formatedHosts();

		let statusLabel = "Online For"
		let statusVal = profile.formattedUptime()
		if (statusVal === "") {
			statusLabel = "Status"
			statusVal = profile.formattedStatus()
		}

		let lastSync = ""
		if (profile.sync_time) {
			lastSync = MiscUtils.formatDateLess(profile.sync_time)
		} else {
			lastSync = "Never"
		}
		syncHosts.push('Last Sync: ' + lastSync)

		return <div className="bp3-card" style={css.card}>
			<div style={css.deleteButtonBox}>
				<ConfirmButton
					className="bp3-minimal bp3-intent-danger bp3-icon-trash"
					style={css.deleteButton}
					safe={true}
					progressClassName="bp3-intent-danger"
					dialogClassName="bp3-intent-danger bp3-icon-delete"
					dialogLabel="Delete Profile"
					confirmMsg="Permanently delete this profile"
					items={[profile.formattedName()]}
					disabled={this.state.disabled}
					onConfirm={this.onDelete}
				/>
			</div>
			<div className="layout horizontal">
				<PageInfo
					style={css.label}
					fields={[
						{
							label: 'ID',
							value: profile.id.substring(0, 18) || '-',
						},
						{
							label: 'Name',
							value: profile.formattedName() || '-',
						},
						{
							label: 'User',
							value: profile.user || '-',
						},
						{
							label: 'Server',
							value: profile.server || '-',
						},
					]}
				/>
				<PageInfo
					style={css.label}
					fields={[
						{
							label: statusLabel,
							value: statusVal,
						},
						{
							label: 'Organization',
							value: profile.organization || '-',
						},
						{
							label: 'Type',
							value: profile.system ? 'System' : 'User',
						},
						{
							label: 'Autostart',
							value: (profile.system &&
								!profile.disabled) ? 'Enabled' : 'Disabled',
						},
					]}
				/>
			</div>
			<PageInfo
				style={css.labelLast}
				fields={[
					{
						label: 'Server Address',
						value: profile.server_addr || '-',
						copy: !!profile.server_addr,
					},
					{
						label: 'Client Address',
						value: profile.client_addr || '-',
						copy: !!profile.client_addr,
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
					<ProfileConnect profile={this.props.profile}/>
					<ProfileSettings profile={this.props.profile}/>
				</div>
			</div>
		</div>;
	}
}
