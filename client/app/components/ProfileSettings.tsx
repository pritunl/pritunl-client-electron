/// <reference path="../References.d.ts"/>
import * as React from "react"
import * as Theme from "../Theme"
import ProfilesStore from "../stores/ProfilesStore"
import * as ProfileTypes from "../types/ProfileTypes"
import * as ProfileActions from "../actions/ProfileActions"
import * as ServiceActions from "../actions/ServiceActions"
import * as Blueprint from "@blueprintjs/core"
import PageInfo from "./PageInfo"
import PageInput from "./PageInput"
import PageSwitch from "./PageSwitch"
import AceEditor from "react-ace"

import "ace-builds/src-noconflict/mode-text"
import "ace-builds/src-noconflict/theme-dracula"
import "ace-builds/src-noconflict/theme-eclipse"

interface Props {
	profile: ProfileTypes.ProfileRo
}

interface State {
	disabled: boolean
	changed: boolean
	dialog: boolean
	profile: ProfileTypes.Profile
	setAutoStart: boolean
	setSystem: boolean
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
			setAutoStart: null,
			setSystem: null,
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

		if (name === "disabled") {
			this.setState({
				...this.state,
				changed: true,
				profile: profile,
				setAutoStart: !profile.disabled,
			})
		} else {
			this.setState({
				...this.state,
				changed: true,
				profile: profile,
			})
		}
	}

	onSave = (): void => {
		let prfl = this.state.profile

		if (prfl) {
			if (this.state.setAutoStart !== null) {
				prfl.disabled = !this.state.setAutoStart
			}

			ProfileActions.commit(this.state.profile).then(() => {
				this.setState({
					...this.state,
					changed: false,
					profile: null,
				})

				if (this.state.setSystem !== null) {
					this.onSaveSystem()
				} else {
					this.closeDialog()
				}
			})
		} else {
			if (this.state.setSystem !== null) {
				this.onSaveSystem()
			} else {
				this.closeDialog()
			}
		}
	}

	onSaveSystem = (): void => {
		let prfl: ProfileTypes.Profile = this.state.profile ||
			this.props.profile;

		if (this.state.setSystem && !prfl.system) {
			prfl.disabled = !this.state.setAutoStart
			prfl.convertSystem().then((): void => {
				this.closeDialog()
			})
		} else if (!this.state.setSystem && !!prfl.system) {
			prfl.convertUser().then((): void => {
				this.closeDialog()
			})
		}
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

		let system = !!profile.system
		if (this.state.setSystem !== null) {
			system = this.state.setSystem
		}

		let autostart = !profile.disabled && !!profile.system
		if (this.state.setAutoStart !== null) {
			autostart = this.state.setAutoStart
		}

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
					<PageInput
						disabled={this.state.disabled}
						label="Name"
						help="Profile name."
						type="text"
						placeholder="Enter name"
						value={profile.name || ""}
						onChange={(val: string): void => {
							this.set("name", val)
						}}
					/>
					<PageSwitch
						disabled={this.state.disabled}
						label="System Profile"
						help="Automatically start profile with system service. Autostart profiles will run for all users."
						checked={system}
						onToggle={(): void => {
							if (!system && this.state.setAutoStart === null) {
								this.setState({
									...this.state,
									changed: true,
									setSystem: !system,
									setAutoStart: true,
								})
							} else {
								this.setState({
									...this.state,
									changed: true,
									setSystem: !system,
								})
							}
						}}
					/>
					<PageSwitch
						disabled={this.state.disabled || !system}
						label="Autostart"
						help="Automatically start profile with system service. Autostart profiles will run for all users. Must be system profile to use autostart."
						checked={autostart && system}
						onToggle={(): void => {
							this.set("disabled", !!autostart)
						}}
					/>
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
