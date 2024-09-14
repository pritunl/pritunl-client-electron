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
import PageInputFile from "./PageInputFile"
import PageSwitch from "./PageSwitch"
import * as Importer from "../utils/Importer"
import path from "path"

interface Props {
	style: React.CSSProperties
}

interface State {
	disabled: boolean
	changed: boolean
	dialog: boolean
	uri: string
	path: string
	fullPath: string
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

export default class ProfileImport extends React.Component<Props, State> {
	constructor(props: Props, context: any) {
		super(props, context)
		this.state = {
			disabled: false,
			changed: false,
			dialog: false,
			uri: "",
			path: "",
			fullPath: "",
		}
	}

	onImport = (): void => {
		this.setState({
			...this.state,
			disabled: true,
		})

		if (this.state.fullPath !== "") {
			Importer.importFile(this.state.fullPath).then(() => {
				this.setState({
					...this.state,
					dialog: false,
					disabled: false,
					changed: false,
					uri: "",
					path: "",
					fullPath: "",
				})
			})
		} else {
			Importer.importUri(this.state.uri).then(() => {
				this.setState({
					...this.state,
					dialog: false,
					disabled: false,
					changed: false,
					uri: "",
					path: "",
					fullPath: "",
				})
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
		})
	}

	render(): JSX.Element {
		return <div style={css.box}>
			<button
				className="bp5-button bp5-minimal bp5-icon-import"
				style={this.props.style}
				type="button"
				disabled={this.state.disabled}
				onClick={this.openDialog}
			>
				Import
			</button>
			<Blueprint.Dialog
				title="Import Profile"
				style={css.dialog}
				isOpen={this.state.dialog}
				usePortal={true}
				portalContainer={document.body}
				onClose={this.closeDialog}
			>
				<div className="bp5-dialog-body">
					<PageInput
						disabled={this.state.disabled}
						label="Profile URI"
						help="Profile URI as shown in the Pritunl server web console."
						type="text"
						placeholder="Enter URI"
						value={this.state.uri}
						onChange={(val: string): void => {
							this.setState({
								...this.state,
								changed: true,
								uri: val,
								path: "",
								fullPath: "",
							})
						}}
					/>
					<PageInputFile
						disabled={this.state.disabled}
						label="Import Profile"
						help="Select profile file in tar, zip, ovpn or conf format."
						accept=".ovpn,.conf,.tar,.zip"
						value={this.state.path}
						onChange={(val: string): void => {
							this.setState({
								...this.state,
								changed: true,
								uri: "",
								path: path.basename(val),
								fullPath: val,
							})
						}}
					/>
				</div>
				<div className="bp5-dialog-footer">
					<div className="bp5-dialog-footer-actions">
						<button
							className="bp5-button bp5-intent-danger bp5-icon-cross"
							type="button"
							disabled={this.state.disabled}
							onClick={this.closeDialog}
						>Cancel</button>
						<button
							className="bp5-button bp5-intent-success bp5-icon-tick"
							type="button"
							disabled={this.state.disabled || !this.state.changed}
							onClick={this.onImport}
						>Import</button>
					</div>
				</div>
			</Blueprint.Dialog>
		</div>
	}
}
