/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as Blueprint from '@blueprintjs/core';
import LoadingStore from '../stores/LoadingStore';

interface Props {
	style?: React.CSSProperties;
	size?: string;
	intent?: Blueprint.Intent;
}

interface State {
	loading: boolean;
}

export default class LoadingCircle extends React.Component<Props, State> {
	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			loading: LoadingStore.loading,
		};
	}

	componentDidMount(): void {
		LoadingStore.addChangeListener(this.onChange);
	}

	componentWillUnmount(): void {
		LoadingStore.removeChangeListener(this.onChange);
	}

	onChange = (): void => {
		this.setState({
			loading: LoadingStore.loading,
		});
	}

	render(): JSX.Element {
		let spinner: JSX.Element;

		if (!this.state.loading) {
			let size;
			switch (this.props.size) {
				case 'small':
					size = '24px';
					break;
				case 'large':
					size = '100px';
					break;
				default:
					size = '50px';
			}

			let style: React.CSSProperties = {
				width: size,
				height: size,
			};

			spinner = <div style={style}/>;
		} else {
			let className = '';
			if (this.props.size) {
				className = 'bp5-' + this.props.size;
			}

			spinner = <Blueprint.Spinner
				className={className}
				intent={this.props.intent}
			/>;
		}

		return <div style={this.props.style}>
			{spinner}
		</div>;
	}
}
