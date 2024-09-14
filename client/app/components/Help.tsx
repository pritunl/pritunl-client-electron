/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as Blueprint from '@blueprintjs/core';

interface Props {
	title: string;
	content: string;
}

interface State {
	popover: boolean;
}

const css = {
	box: {
		position: 'relative',
		display: 'inline',
	} as React.CSSProperties,
	content: {
		padding: '20px',
	} as React.CSSProperties,
	button: {
		position: 'absolute',
		top: '-7px',
		left: '-2px',
		padding: '7px',
		background: 'none',
		opacity: 0.3,
	} as React.CSSProperties,
	popover: {
		width: '230px',
	} as React.CSSProperties,
	popoverTarget: {
		top: '9px',
		left: '18px',
	} as React.CSSProperties,
	dialog: {
		maxWidth: '400px',
		margin: '30px 20px',
	} as React.CSSProperties,
};

let dialog = true;

export default class Help extends React.Component<Props, State> {
	constructor(props: Props, context: any) {
		super(props, context);
		this.state = {
			popover: false,
		};
	}

	render(): JSX.Element {
		let helpElm: JSX.Element;
		if (this.state.popover) {
			if (dialog) {
				helpElm = <Blueprint.Dialog
					title={this.props.title}
					style={css.dialog}
					isOpen={this.state.popover}
					usePortal={true}
					portalContainer={document.body}
					onClose={(): void => {
						this.setState({
							...this.state,
							popover: false,
						});
					}}
				>
					<div className="bp5-dialog-body">
						{this.props.content}
					</div>
					<div className="bp5-dialog-footer">
						<div className="bp5-dialog-footer-actions">
							<button
								className="bp5-button"
								type="button"
								onClick={(): void => {
									this.setState({
										...this.state,
										popover: !this.state.popover,
									});
								}}
							>Close</button>
						</div>
					</div>
				</Blueprint.Dialog>;
			} else {
				helpElm = <span
					className="bp5-popover-target"
					style={css.popoverTarget}
				>
				<span className="bp5-overlay bp5-overlay-inline">
					<span>
						<div
							className={'bp5-transition-container ' +
							'bp5-tether-element-attached-middle ' +
							'bp5-tether-element-attached-left ' +
							'bp5-tether-target-attached-middle ' +
							'bp5-tether-target-attached-right bp5-overlay-content'}
							style={css.popover}
						>
							<div className="bp5-popover">
								<div className="bp5-popover-arrow">
									<svg viewBox="0 0 30 30">
										<path
											className="bp5-popover-arrow-border"
											d={'M8.11 6.302c1.015-.936 1.887-2.922 ' +
											'1.887-4.297v26c0-1.378-' +
											'.868-3.357-1.888-4.297L.925 ' +
											'17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z'}
										/>
										<path
											className="bp5-popover-arrow-fill"
											d={'M8.787 7.036c1.22-1.125 2.21-3.376 ' +
											'2.21-5.03V0v30-2.005c0-1.654-' +
											'.983-3.9-2.21-5.03l-7.183-6.616c-' +
											'.81-.746-.802-1.96 0-2.7l7.183-6.614z'}
										/>
									</svg>
								</div>
								<div
									className="bp5-popover-content"
									style={css.content}
								>
									<h5>{this.props.title}</h5>
									<div>{this.props.content}</div>
								</div>
							</div>
						</div>
					</span>
				</span>
			</span>;
			}
		}

		return <div style={css.box}>
			<div
				className="bp5-button bp5-minimal bp5-icon-help"
				style={css.button}
				onClick={(): void => {
					this.setState({
						...this.state,
						popover: !this.state.popover,
					});
				}}
			/>
			{helpElm}
		</div>;
	}
}
