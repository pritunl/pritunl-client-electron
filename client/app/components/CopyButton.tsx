/// <reference path="../References.d.ts"/>
import * as React from 'react';

interface Props {
	value: string;
}

interface State {
	hover: boolean;
	click: boolean;
	copied: boolean;
}

const css = {
	copy: {
		cursor: 'pointer',
		marginLeft: '3px',
	} as React.CSSProperties,
	copyHover: {
		cursor: 'pointer',
		marginLeft: '3px',
		opacity: 0.7,
	} as React.CSSProperties,
	copyClicked: {
		cursor: 'pointer',
		marginLeft: '3px',
		opacity: 0.5,
	} as React.CSSProperties,
};

export default class CopyButton extends React.Component<Props, State> {
	elem: HTMLSpanElement;

	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			hover: false,
			click: false,
			copied: false,
		};
	}
	render(): JSX.Element {
		let style: React.CSSProperties;
		if (this.state.click && !this.state.copied) {
			style = css.copyClicked;
		} else if (this.state.hover && !this.state.copied) {
			style = css.copyHover;
		} else {
			style = css.copy;
		}

		let className = 'bp5-icon-standard';
		if (this.state.copied) {
			className += ' bp5-icon-tick bp5-intent-success';
		} else {
			className += ' bp5-icon-clipboard';
		}

		return <span
			ref={(elem) => this.elem = elem}
			className={className}
			style={style}
			onMouseEnter={() => {
				this.setState({
					...this.state,
					hover: true,
				});
			}}
			onMouseLeave={() => {
				this.setState({
					...this.state,
					hover: false,
					click: false,
				});
			}}
			onMouseDown={() => {
				this.setState({
					...this.state,
					click: true,
				});
			}}
			onMouseUp={() => {
				this.setState({
					...this.state,
					click: false,
				});
			}}
			onClick={() => {
				this.setState({
					...this.state,
					copied: true,
				});
				setTimeout(() => {
					this.setState({
						...this.state,
						copied: false,
					});
				}, 1200);

				let elem = document.createElement('input');
				elem.contentEditable = 'true';
				elem.readOnly = true;
				elem.style.position = 'absolute';
				elem.style.width = '1px';
				elem.style.height = '1px';
				elem.style.padding = '0px';
				elem.style.border = 'none';
				elem.style.opacity = '0';
				elem.value = this.props.value;
				this.elem.parentElement.append(elem);

				elem.select();

				document.execCommand('copy');
				elem.remove();
			}}
		/>;
	}
}
