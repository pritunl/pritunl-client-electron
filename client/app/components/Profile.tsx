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
import * as PageInfos from './PageInfo';
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
		top: "4px",
		right: "4px",
	} as React.CSSProperties,
	buttons: {
	} as React.CSSProperties,
	editor: {
		margin: '10px 0 0 0',
	} as React.CSSProperties,
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		padding: '4px',
		height: '39px',
	} as React.CSSProperties,
	headerLabel: {
		fontSize: "1.09em",
		margin: "5px 34px 0 6px",
		overflow: "hidden",
		whiteSpace: "nowrap",
	} as React.CSSProperties,
	body: {
		paddingTop: "31px"
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

		let statusLabel = "Online For"
		let statusVal = profile.formattedUptime()
		if (statusVal === "") {
			statusLabel = "Status"
			statusVal = profile.formattedStatus()
		}

		let fieldsLeft: PageInfos.Field[] = [
			{
				label: 'User',
				value: profile.user || '-',
			},
			{
				label: 'Server',
				value: profile.server || '-',
			},
		]

		let fieldsRight: PageInfos.Field[] = [
			{
				label: statusLabel,
				value: statusVal,
			},
			{
				label: 'Organization',
				value: profile.organization || '-',
			},
		]

		let fieldsLong: PageInfos.Field[] = []

		let longIp = false
		if ((profile.server_addr && profile.server_addr.length >= 16) ||
			(profile.client_addr && profile.client_addr.length >= 16)) {

			fieldsLong.push({
				label: 'Server Address',
				value: profile.server_addr || '-',
				copy: !!profile.server_addr,
			})
			fieldsLong.push({
				label: 'Client Address',
				value: profile.client_addr || '-',
				copy: !!profile.client_addr,
			})

			longIp = true
		} else if (profile.server_addr || profile.client_addr) {
			fieldsLeft.push({
				label: 'Server Address',
				value: profile.server_addr || '-',
				copy: !!profile.server_addr,
			})
			fieldsRight.push({
				label: 'Client Address',
				value: profile.client_addr || '-',
				copy: !!profile.client_addr,
			})
		}

		return <div className="bp3-card layout vertical" style={css.card}>
			<div className="bp3-card-header" style={css.header}>
				<h3
					style={css.headerLabel}
				>{profile.formattedName() || 'Profile'}</h3>
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
			</div>
			<div className="layout horizontal" style={css.body}>
				<PageInfo
					style={css.label}
					fields={fieldsLeft}
				/>
				<PageInfo
					style={css.label}
					fields={fieldsRight}
				/>
			</div>
			<PageInfo
				style={css.labelLast}
				hidden={!longIp}
				fields={fieldsLong}
			/>
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
