/// <reference path="../References.d.ts"/>
import * as React from 'react';
import Help from './Help';
import * as Theme from "../Theme"

interface Props {
	hidden?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	label: string;
	help: string;
	placeholder: string;
	rows: number;
	value: string;
	onChange: (val: string) => void;
}

const css = {
	label: {
		width: '100%',
		maxWidth: '280px',
	} as React.CSSProperties,
	textarea: {
		width: '100%',
		resize: 'none',
		fontSize: '12px',
		fontFamily: Theme.monospaceFont,
		fontWeight: Theme.monospaceWeight,
	} as React.CSSProperties,
};

export default class PageTextArea extends React.Component<Props, {}> {
	render(): JSX.Element {
		return <label
			className="bp5-label"
			style={css.label}
			hidden={this.props.hidden}
		>
			{this.props.label}
			<Help
				title={this.props.label}
				content={this.props.help}
			/>
			<textarea
				className="bp5-input"
				style={css.textarea}
				disabled={this.props.disabled}
				readOnly={this.props.readOnly}
				autoCapitalize="off"
				spellCheck={false}
				placeholder={this.props.placeholder}
				rows={this.props.rows}
				value={this.props.value || ''}
				onChange={(evt): void => {
					this.props.onChange(evt.target.value);
				}}
			/>
		</label>;
	}
}
