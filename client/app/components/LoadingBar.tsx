/// <reference path="../References.d.ts"/>
import * as React from 'react';
import LoadingStore from '../stores/LoadingStore';

interface Props {
	style?: React.CSSProperties;
	size?: string;
	intent?: string;
}

interface State {
	loading: boolean;
}

const css = {
	progress: {
		width: '100%',
		height: '4px',
		borderRadius: 0,
	} as React.CSSProperties,
	progressBar: {
		width: '50%',
		borderRadius: 0,
	} as React.CSSProperties,
};

export default class LoadingBar extends React.Component<Props, State> {
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
		let progress: JSX.Element;

		if (!this.state.loading) {
			progress = <div style={css.progress}/>;
		} else {
			let className = 'bp5-progress-bar bp5-no-stripes bp5-no-animation ';
			if (this.props.intent) {
				className += ' bp5-intent-' + this.props.intent;
			}

			progress = <div className={className} style={css.progress}>
				<div
					className="bp5-progress-meter bp5-loading-bar"
					style={css.progressBar}
				/>
			</div>;
		}

		return <div style={this.props.style}>
			{progress}
		</div>;
	}
}
