/// <reference path="../References.d.ts"/>
import * as React from "react"
import Help from "./Help"
import electron from "electron"

interface Props {
	hidden?: boolean
	disabled?: boolean
	label: string
	help: string
	accept?: string
	value: string
	onChange?: (val: string) => void
}

const css = {
	label: {
		width: "100%",
		maxWidth: "280px",
		marginBottom: "5px",
	} as React.CSSProperties,
	input: {
		width: "100%",
	} as React.CSSProperties,
	inputBox: {
		display: "block",
		maxWidth: "280px",
		width: "100%",
	} as React.CSSProperties,
}

export default class PageInputFile extends React.Component<Props, {}> {
	render(): JSX.Element {
		let label = this.props.value || "Choose profile file..."

		return <div>
			<label
				className="bp5-label"
				style={css.label}
				hidden={this.props.hidden}
			>
				{this.props.label}
				<Help
					title={this.props.label}
					content={this.props.help}
				/>
			</label>
			<label
				className="bp5-file-input"
				style={css.inputBox}
			>
				<input
					style={css.input}
					type="file"
					accept={this.props.accept}
					disabled={this.props.disabled}
					onChange={(evt): void => {
						let file: File
						if (evt.target.files && evt.target.files.length) {
							file = evt.target.files[0]
						} else if (evt.currentTarget.files &&
								evt.currentTarget.files.length) {
							file = evt.currentTarget.files[0]
						}
						let pth = electron.webUtils.getPathForFile(file)

						if (this.props.onChange) {
							this.props.onChange(pth)
						}
					}}
				/>
				<span className="bp5-file-upload-input">{label}</span>
			</label>
		</div>
	}
}
