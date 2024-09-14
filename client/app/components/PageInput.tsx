/// <reference path="../References.d.ts"/>
import * as React from 'react';
import Help from './Help';

interface Props {
	hidden?: boolean;
	disabled?: boolean;
	readOnly?: boolean;
	autoFocus?: boolean;
	autoSelect?: boolean;
	label: string;
	help: string;
	type: string;
	placeholder: string;
	value: string | number;
	onKeyUp?: (key: string) => void;
	onChange?: (val: string) => void;
}

const css = {
	label: {
		width: '100%',
		maxWidth: '280px',
	} as React.CSSProperties,
	input: {
		width: '100%',
	} as React.CSSProperties,
};

export default class PageInput extends React.Component<Props, {}> {
	autoSelect = (evt: React.MouseEvent<HTMLInputElement>): void => {
		evt.currentTarget.select();
	}

	render(): JSX.Element {
		let value: any = this.props.value;
		value = isNaN(value) ? this.props.value || '' : this.props.value;

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
			<input
				className="bp5-input"
				style={css.input}
				type={this.props.type}
				disabled={this.props.disabled}
				readOnly={this.props.readOnly}
				autoFocus={this.props.autoFocus}
				autoCapitalize="off"
				spellCheck={false}
				placeholder={this.props.placeholder}
				value={value}
				onClick={this.props.autoSelect ? this.autoSelect : null}
				onKeyUp={(evt): void => {
					if (this.props.onKeyUp) {
						this.props.onKeyUp(evt.key);
					}
				}}
				onChange={(evt): void => {
					if (this.props.onChange) {
						this.props.onChange(evt.target.value);
					}
				}}
			/>
		</label>;
	}
}
