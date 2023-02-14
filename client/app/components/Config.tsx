/// <reference path="../References.d.ts"/>
import * as React from "react"
import * as ConfigActions from "../actions/ConfigActions"
import * as ConfigTypes from "../types/ConfigTypes"
import ConfigStore from "../stores/ConfigStore"
import PageSwitch from "./PageSwitch"
import PageNumInput from "./PageNumInput"

interface State {
	config: ConfigTypes.Config
	changed: boolean
	disabled: boolean
}

const css = {
	message: {
		margin: "0 0 6px 0",
	} as React.CSSProperties,
	header: {
		margin: "0 0 5px 0",
	} as React.CSSProperties,
	card: {
		position: "relative",
		margin: "8px",
	} as React.CSSProperties,
	footer: {
		margin: 0,
	} as React.CSSProperties,
}

export default class Config extends React.Component<{}, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			config: ConfigStore.config,
			changed: false,
			disabled: false,
		};
	}

	componentDidMount(): void {
		ConfigStore.addChangeListener(this.onChange)
		ConfigActions.sync()
	}

	componentWillUnmount(): void {
		ConfigStore.removeChangeListener(this.onChange)
	}

	onChange = (): void => {
		this.setState({
			...this.state,
			config: ConfigStore.config,
		})
	}

	set(name: string, val: any): void {
		let config: any

		config = {
			...this.state.config,
		}

		config[name] = val

		this.setState({
			...this.state,
			changed: true,
			config: config,
		})
	}

	onCancel = (): void => {
		this.setState({
			...this.state,
			changed: false,
			config: ConfigStore.config,
		})
	}

	onSave = (): void => {
		this.setState({
			...this.state,
			disabled: true,
		})

		ConfigActions.commit(this.state.config).then(() => {
			this.setState({
				...this.state,
				changed: false,
				disabled: false,
			})
		})
	}

	render(): JSX.Element {
		return <div className="bp3-card layout vertical flex" style={css.card}>
			<div className="layout horizontal">
				<h3 style={css.header}>Advanced Settings</h3>
			</div>
			<div className="layout horizontal">
				<PageSwitch
					disabled={this.state.disabled}
					label="Disable DNS watch"
					help="Disable automatic correction of DNS changes if configuration is lost from network change."
					checked={!!this.state.config.disable_dns_watch}
					onToggle={(): void => {
						this.set("disable_dns_watch",
							!this.state.config.disable_dns_watch)
					}}
				/>
			</div>
			<div className="layout horizontal">
				<PageSwitch
					disabled={this.state.disabled}
					label="Disable device wake watch"
					help="Disable wake watch used for faster reconnections when device is resumed from sleep."
					checked={!!this.state.config.disable_wake_watch}
					onToggle={(): void => {
						this.set("disable_wake_watch",
							!this.state.config.disable_wake_watch)
					}}
				/>
			</div>
			<div className="layout horizontal">
				<PageSwitch
					disabled={this.state.disabled}
					label="Disable network clean"
					help="Disable Windows VPN interface cleanup on startup."
					checked={!!this.state.config.disable_net_clean}
					onToggle={(): void => {
						this.set("disable_net_clean",
							!this.state.config.disable_net_clean)
					}}
				/>
			</div>
			<div className="layout horizontal">
				<PageNumInput
					label="Interface Metric"
					help="Configure the VPN interfaces metric on Windows. Set to 0 to leave interfaces unmodified."
					min={0}
					max={9999}
					stepSize={1}
					disabled={this.state.disabled}
					selectAllOnFocus={true}
					value={this.state.config.interface_metric}
					onChange={(val: number): void => {
						this.set('interface_metric', val);
					}}
				/>
			</div>
			<div className="layout horizontal flex"/>
			<div className="bp3-dialog-footer" style={css.footer}>
				<div className="bp3-dialog-footer-actions">
					<button
						className="bp3-button bp3-intent-danger bp3-icon-cross"
						type="button"
						disabled={this.state.disabled || !this.state.changed}
						onClick={this.onCancel}
					>Cancel</button>
					<button
						className="bp3-button bp3-intent-success bp3-icon-tick"
						type="button"
						disabled={this.state.disabled || !this.state.changed}
						onClick={this.onSave}
					>Save</button>
				</div>
			</div>
		</div>;
	}
}
