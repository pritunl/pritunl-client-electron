/// <reference path="../References.d.ts"/>
import * as React from 'react';
import Help from './Help';
import ConfirmButton from './ConfirmButton';

interface Props {
	buttonClass?: string;
	hidden?: boolean;
	disabled?: boolean;
	buttonConfirm?: boolean;
	buttonDisabled?: boolean;
	readOnly?: boolean;
	autoSelect?: boolean;
	label?: string;
	labelTop?: boolean;
	listStyle?: boolean;
	help?: string;
	type: string;
	placeholder?: string;
	value: string;
	onChange?: (val: string) => void;
	onSubmit: () => void;
}

const css = {
	group: {
		marginBottom: '15px',
		width: '100%',
		maxWidth: '280px',
	} as React.CSSProperties,
	groupList: {
		marginTop: '5px',
		width: '100%',
		maxWidth: '280px',
	} as React.CSSProperties,
	groupTop: {
		width: '100%',
		maxWidth: '280px',
	} as React.CSSProperties,
	label: {
		width: '100%',
		maxWidth: '280px',
	} as React.CSSProperties,
	input: {
		width: '100%',
	} as React.CSSProperties,
	inputBox: {
		flex: '1',
	} as React.CSSProperties,
	buttonTop: {
		marginTop: '5px',
	} as React.CSSProperties,
};

export default class PageInputButton extends React.Component<Props, {}> {
	autoSelect = (evt: React.MouseEvent<HTMLInputElement>): void => {
		evt.currentTarget.select();
	}

	render(): JSX.Element {
		let buttonClass = 'bp5-button';
		if (this.props.buttonClass) {
			buttonClass += ' ' + this.props.buttonClass;
		}

		let buttonLabel = '';
		let buttonStyle: React.CSSProperties;
		if (this.props.labelTop) {
			buttonStyle = css.buttonTop;
		} else {
			buttonLabel = this.props.label || '';
		}

		let button: JSX.Element;
		if (this.props.buttonConfirm) {
			button = <ConfirmButton
				className={buttonClass}
				style={buttonStyle}
				progressClassName="bp5-intent-danger"
				disabled={this.props.disabled || this.props.buttonDisabled}
				grouped={true}
				onConfirm={this.props.onSubmit}
				label={buttonLabel}
			/>;
		} else {
			button = <button
				className={buttonClass}
				style={buttonStyle}
				disabled={this.props.disabled || this.props.buttonDisabled}
				onClick={this.props.onSubmit}
			>{buttonLabel}</button>;
		}

		if (this.props.labelTop) {
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
				<div
					className="bp5-control-group"
					style={css.groupTop}
					hidden={this.props.hidden}
				>
					<div style={css.inputBox}>
						<input
							className="bp5-input"
							style={css.input}
							type={this.props.type}
							disabled={this.props.disabled}
							readOnly={this.props.readOnly}
							autoCapitalize="off"
							spellCheck={false}
							placeholder={this.props.placeholder}
							value={this.props.value || ''}
							onClick={this.props.autoSelect ? this.autoSelect : null}
							onChange={(evt): void => {
								if (this.props.onChange) {
									this.props.onChange(evt.target.value);
								}
							}}
							onKeyPress={(evt): void => {
								if (evt.key === 'Enter') {
									this.props.onSubmit();
								}
							}}
						/>
					</div>
					<div>
						{button}
					</div>
				</div>
			</label>;
		} else {
			return <div
				className="bp5-control-group"
				style={this.props.listStyle ? css.groupList : css.group}
				hidden={this.props.hidden}
			>
				<div style={css.inputBox}>
					<input
						className="bp5-input"
						style={css.input}
						type={this.props.type}
						disabled={this.props.disabled}
						readOnly={this.props.readOnly}
						autoCapitalize="off"
						spellCheck={false}
						placeholder={this.props.placeholder || ''}
						value={this.props.value || ''}
						onChange={(evt): void => {
							if (this.props.onChange) {
								this.props.onChange(evt.target.value);
							}
						}}
						onKeyPress={(evt): void => {
							if (evt.key === 'Enter') {
								this.props.onSubmit();
							}
						}}
					/>
				</div>
				<div>
					{button}
				</div>
			</div>;
		}
	}
}
