/// <reference path="../References.d.ts"/>
import * as React from "react"
import * as Theme from "../Theme"
import ProfilesStore from "../stores/ProfilesStore"
import * as ProfileTypes from "../types/ProfileTypes"
import * as ProfileActions from "../actions/ProfileActions"
import * as ServiceActions from "../actions/ServiceActions"
import * as Blueprint from "@blueprintjs/core"
import PageInfo from "./PageInfo"
import PageSwitch from "./PageSwitch"
import AceEditor from "react-ace"

import "ace-builds/src-noconflict/mode-text"
import "ace-builds/src-noconflict/theme-dracula"
import "ace-builds/src-noconflict/theme-eclipse"
import * as MiscUtils from "../utils/MiscUtils"
import * as Constants from "../Constants"

interface Props {
	profile: ProfileTypes.ProfileRo
}

interface State {
	disabled: boolean
	changed: boolean
	dialog: boolean
	profile: ProfileTypes.Profile
}

const css = {
	box: {
		display: "inline-block"
	} as React.CSSProperties,
	button: {
		marginRight: "10px",
	} as React.CSSProperties,
	dialog: {
		width: "340px",
		position: "absolute",
	} as React.CSSProperties,
	label: {
		width: "100%",
		maxWidth: "220px",
		margin: "18px 0 0 0",
	} as React.CSSProperties,
	input: {
		width: "100%",
	} as React.CSSProperties,
}

export default class ProfileSettings extends React.Component<Props, State> {
	constructor(props: Props, context: any) {
		super(props, context)
		this.state = {
			disabled: false,
			changed: false,
			dialog: false,
			profile: null,
		}
	}

	set(name: string, val: any): void {
		let profile: any

		if (this.state.changed) {
			profile = {
				...this.state.profile,
			}
		} else {
			profile = {
				...this.props.profile,
			}
		}

		profile[name] = val

		this.setState({
			...this.state,
			changed: true,
			profile: profile,
		})
	}

	onSave = (): void => {
		ProfileActions.commit(this.state.profile).then(() => {
			this.closeDialog()
		})
	}

	openDialog = (): void => {
		this.setState({
			...this.state,
			dialog: true,
		})
	}

	closeDialog = (): void => {
		this.setState({
			...this.state,
			dialog: false,
			profile: null,
		})
	}

	render(): JSX.Element {
		let profile: ProfileTypes.Profile = this.state.profile ||
			this.props.profile;

		return <div style={css.box}>
			<button
				className="bp3-button bp3-icon-cog"
				style={css.button}
				type="button"
				disabled={this.state.disabled}
				onClick={this.openDialog}
			>
				Settings
			</button>
			<Blueprint.Dialog
				title="Profile Settings"
				style={css.dialog}
				isOpen={this.state.dialog}
				usePortal={true}
				portalContainer={document.body}
				onClose={this.closeDialog}
			>
				<div className="bp3-dialog-body">
					<label
						className="bp3-label"
						style={css.label}
					>
						Name
						<input
							className="bp3-input"
							style={css.input}
							disabled={this.state.disabled}
							autoCapitalize="off"
							spellCheck={false}
							placeholder="Enter name"
							value={profile.name || ""}
							onChange={(evt): void => {
								this.set("name", evt.target.value)
							}}
						/>
					</label>
				</div>
				<div className="bp3-dialog-footer">
					<div className="bp3-dialog-footer-actions">
						<button
							className="bp3-button bp3-intent-danger"
							type="button"
							onClick={this.closeDialog}
						>Cancel</button>
						<button
							className="bp3-button bp3-intent-success bp3-icon-link"
							type="button"
							disabled={this.state.disabled || !this.state.changed}
							onClick={this.onSave}
						>Save</button>
					</div>
				</div>
			</Blueprint.Dialog>
		</div>
	}
}
