/// <reference path="../References.d.ts"/>
import * as React from 'react';
import Help from './Help';

interface Props {
	hidden?: boolean;
	label: string;
	help: string;
	type: string;
	placeholder: string;
	value: string | number;
	checked: boolean;
	defaultValue: string;
	onChange: (state: boolean, val: string) => void;
}

const css = {
	switchLabel: {
		display: 'inline-block',
		marginBottom: 0,
	} as React.CSSProperties,
	inputLabel: {
		width: '100%',
		maxWidth: '280px',
	} as React.CSSProperties,
	input: {
		width: '100%',
	} as React.CSSProperties,
};

export default class PageInputSwitch extends React.Component<Props, {}> {
	render(): JSX.Element {
		return <div hidden={this.props.hidden}>
			<label className="bp5-control bp5-switch" style={css.switchLabel}>
				<input
					type="checkbox"
					checked={!!this.props.value || this.props.checked}
					onChange={(): void => {
						if (!!this.props.value || this.props.checked) {
							this.props.onChange(false, null);
						} else {
							this.props.onChange(true, this.props.defaultValue);
						}
					}}
				/>
				<span className="bp5-control-indicator"/>
				{this.props.label}
			</label>
			<Help
				title={this.props.label}
				content={this.props.help}
			/>
			<label className="bp5-label" style={css.inputLabel}>
				<input
					className="bp5-input"
					style={css.input}
					hidden={!this.props.value && !this.props.checked}
					type={this.props.type}
					autoCapitalize="off"
					spellCheck={false}
					placeholder={this.props.placeholder}
					value={this.props.value || ''}
					onChange={(evt): void => {
						this.props.onChange(true, evt.target.value);
					}}
				/>
			</label>
		</div>;
	}
}
