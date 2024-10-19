/// <reference path="../References.d.ts"/>
import * as React from "react"
import * as Theme from "../Theme"

import * as MonacoEditor from "@monaco-editor/react"

interface Props {
	disabled?: boolean
	value: string
	readOnly?: boolean
	mode?: string
	fontSize?: number
	height?: string
	width?: string
	onChange?: (value: string) => void
}

interface State {
}

const css = {
	editorBox: {
		margin: "10px 0",
	} as React.CSSProperties,
	editor: {
		margin: "11px 0 10px 0",
		borderRadius: "3px",
		overflow: "hidden",
		width: "100%",
	} as React.CSSProperties,
}

export default class Editor extends React.Component<Props, State> {
	constructor(props: any, context: any) {
		super(props, context)
		this.state = {
		}
	}

	render(): JSX.Element {
		return <div className="layout horizontal flex" style={css.editorBox}>
			<div style={css.editor}>
				<MonacoEditor.Editor
					height={this.props.height}
					width={this.props.width}
					defaultLanguage="markdown"
					theme={Theme.getEditorTheme()}
					value={this.props.value}
					options={{
						folding: false,
						fontSize: this.props.fontSize,
						fontFamily: Theme.monospaceFont,
						fontWeight: Theme.monospaceWeight,
						tabSize: 4,
						detectIndentation: false,
						readOnly: this.props.readOnly,
						//rulers: [80],
						scrollBeyondLastLine: false,
						minimap: {
							enabled: false,
						},
						wordWrap: "on",
					}}
					onChange={(val): void => {
						if (this.props.onChange) {
							this.props.onChange(val)
						}
					}}
				/>
			</div>
		</div>
	}
}
