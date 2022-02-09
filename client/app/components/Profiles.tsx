/// <reference path="../References.d.ts"/>
import * as React from 'react';
import ProfilesStore from '../stores/ProfilesStore';
import * as ProfileTypes from '../types/ProfileTypes';
import * as ProfileActions from '../actions/ProfileActions';
import Profile from "./Profile";

interface State {
	profiles: ProfileTypes.ProfilesRo;
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

export default class Profiles extends React.Component<{}, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			profiles: ProfilesStore.profiles,
		};
	}

	componentDidMount(): void {
		ProfilesStore.addChangeListener(this.onChange);
		ProfileActions.sync();
	}

	componentWillUnmount(): void {
		ProfilesStore.removeChangeListener(this.onChange);
	}

	onChange = (): void => {
		this.setState({
			profiles: ProfilesStore.profiles,
		});
	}

	render(): JSX.Element {
		let profilesDom: JSX.Element[] = [];

		this.state.profiles.forEach((prfl: ProfileTypes.ProfileRo): void => {
			profilesDom.push(<Profile
				key={prfl.server_id}
				profile={prfl}
			/>);
		});

		return <div>
			{profilesDom}
		</div>;
	}
}
