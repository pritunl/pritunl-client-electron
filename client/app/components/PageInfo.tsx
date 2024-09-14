/// <reference path="../References.d.ts"/>
import * as React from 'react';
import CopyButton from './CopyButton';

export interface Field {
	valueClass?: string;
	valueClasses?: string[];
	label: string;
	value: string | number | boolean | string[];
	copy?: boolean;
}

export interface Bar {
	progressClass?: string;
	label: string;
	value: number;
	color?: string;
}

export interface Props {
	style?: React.CSSProperties;
	hidden?: boolean;
	fields?: Field[];
	bars?: Bar[];
}

const css = {
	label: {
		width: '100%',
		maxWidth: '320px',
	} as React.CSSProperties,
	value: {
		wordWrap: 'break-word',
	} as React.CSSProperties,
	item: {
		marginBottom: '5px',
	} as React.CSSProperties,
	bar: {
		maxWidth: '280px',
	} as React.CSSProperties,
	copy: {
		cursor: 'pointer',
		marginLeft: '3px',
	} as React.CSSProperties,
	copyHover: {
		cursor: 'pointer',
		marginLeft: '3px',
		opacity: 0.7,
	} as React.CSSProperties,
};

export default class PageInfo extends React.Component<Props, {}> {
	render(): JSX.Element {
		let fields: JSX.Element[] = [];
		let bars: JSX.Element[] = [];

		for (let field of this.props.fields || []) {
			if (field == null) {
				continue;
			}

			let value: string | JSX.Element[];
			let copyBtn: JSX.Element;

			if (typeof field.value === 'string') {
				value = field.value;
				if (field.copy) {
					copyBtn = <CopyButton
						value={field.value}
					/>;
				}
			} else if (typeof field.value === 'number') {
				value = field.value.toString();
				if (field.copy) {
					copyBtn = <CopyButton
						value={field.value.toString()}
					/>;
				}
			} else if (typeof field.value === 'boolean') {
				value = field.value.toString();
				if (field.copy) {
					copyBtn = <CopyButton
						value={field.value.toString()}
					/>;
				}
			} else if (field.value === undefined || field.value === null) {
				value = 'null'
				if (field.copy) {
					copyBtn = <CopyButton
						value={value}
					/>;
				}
			} else {
				value = [];
				for (let i = 0; i < field.value.length; i++) {
					let copyItemBtn: JSX.Element;

					if (field.copy) {
						copyItemBtn = <CopyButton
							value={field.value[i]}
						/>;
					}

					value.push(
						<div
							key={i}
							className={
								field.valueClasses ?
								field.valueClasses[i] :
								(field.valueClass || 'bp5-text-muted')
							}
						>
							{field.value[i]}{copyItemBtn}
						</div>
					);
				}
			}

			fields.push(
				<div key={field.label} style={css.item}>
					{field.label}
					<div
						className={field.valueClass || 'bp5-text-muted'}
						style={css.value}
					>
						{value}{copyBtn}
					</div>
				</div>,
			);
		}

		for (let bar of this.props.bars || []) {
			let style: React.CSSProperties = {
				width: (bar.value || 0) + '%',
			};

			if (bar.color) {
				style.backgroundColor = bar.color;
			}

			bars.push(
				<div key={bar.label} style={css.item}>
					{bar.label}
					<div
						className={'bp5-progress-bar ' + (bar.progressClass || '')}
						style={css.bar}
					>
						<div className="bp5-progress-meter" style={style}/>
					</div>
				</div>,
			);
		}

		let labelStyle: React.CSSProperties;
		if (this.props.style) {
			labelStyle = {
				...css.label,
				...this.props.style,
			};
		} else {
			labelStyle = css.label;
		}

		return <label
			className="bp5-label"
			style={labelStyle}
			hidden={this.props.hidden}
		>
			{fields}
			{bars}
		</label>;
	}
}
