/// <reference path="../References.d.ts"/>
import Dispatcher from '../dispatcher/Dispatcher';
import EventEmitter from '../EventEmitter';
import * as ProfileTypes from '../types/ProfileTypes';
import * as GlobalTypes from '../types/GlobalTypes';

class ProfilesStore extends EventEmitter {
	_profiles: ProfileTypes.Profiles = [];
	_page: number;
	_pageCount: number;
	_filter: ProfileTypes.Filter = null;
	_count: number;
	_map: {[key: string]: number} = {};
	_token = Dispatcher.register((this._callback).bind(this));

	_reset(): void {
		this._profiles = [];
		this._page = undefined;
		this._pageCount = undefined;
		this._filter = null;
		this._count = undefined;
		this._map = {};
		this.emitChange();
	}

	get profiles(): ProfileTypes.ProfilesRo {
		return this._profiles;
	}

	get profilesM(): ProfileTypes.Profiles {
		let profiles: ProfileTypes.Profiles = [];
		this._profiles.forEach((profile: ProfileTypes.ProfileRo): void => {
			profiles.push({
				...profile,
			});
		});
		return profiles;
	}

	get page(): number {
		return this._page || 0;
	}

	get pageCount(): number {
		return this._pageCount || 20;
	}

	get pages(): number {
		return Math.ceil(this.count / this.pageCount);
	}

	get filter(): ProfileTypes.Filter {
		return this._filter;
	}

	get count(): number {
		return this._count || 0;
	}

	profile(id: string): ProfileTypes.ProfileRo {
		let i = this._map[id];
		if (i === undefined) {
			return null;
		}
		return this._profiles[i];
	}

	emitChange(): void {
		this.emitDefer(GlobalTypes.CHANGE);
	}

	addChangeListener(callback: () => void): void {
		this.on(GlobalTypes.CHANGE, callback);
	}

	removeChangeListener(callback: () => void): void {
		this.removeListener(GlobalTypes.CHANGE, callback);
	}

	_traverse(page: number): void {
		this._page = Math.min(this.pages, page);
	}

	_filterCallback(filter: ProfileTypes.Filter): void {
		if ((this._filter !== null && filter === null) ||
			(!Object.keys(this._filter).length && filter !== null) || (
				filter && this._filter && (
					filter.name !== this._filter.name
				))) {
			this._traverse(0);
		}
		this._filter = filter;
		this.emitChange();
	}

	_sync(prfls: ProfileTypes.Profiles,
		systemPrfls: ProfileTypes.Profiles): void {

		for (let prfl of systemPrfls) {
			prfl.system = true
		}

		let profiles: ProfileTypes.Profiles = []
		let profilesData: ProfileTypes.Profiles = prfls.concat(systemPrfls)
		let names: string[] = []
		let namesMap: {[key: string]: ProfileTypes.Profile[]} = {}

		for (let prflData of profilesData) {
			let prfl = ProfileTypes.New(prflData)
			let name = prfl.formattedName()

			let prflsName: ProfileTypes.Profile[] = namesMap[name]
			if (!prflsName) {
				prflsName = []
			}
			prflsName.push(prfl)

			names.push(name)
			namesMap[name] = prflsName
		}

		names.sort()

		this._map = {}
		let count = 0

		for (let name of names) {
			for (let prlf of namesMap[name]) {
				this._map[prlf.id] = count
				profiles.push(prlf)
				count += 1
			}
		}

		this._count = profiles.length
		this._profiles = profiles
		this._page = Math.min(this.pages, this.page)
	}

	_syncState(profiles: ProfileTypes.ProfilesMap): void {
		for (let prflId in profiles) {
			let prflState = profiles[prflId]

			let index = this._map[prflState.id]
			if (index === undefined) {
				continue
			}

			let prfl = {
				...this._profiles[index],
			}

			prfl.status = prflState.status
			prfl.timestamp = prflState.timestamp
			prfl.server_addr = prflState.server_addr
			prfl.client_addr = prflState.client_addr
			prfl.auth_reconnect = prflState.auth_reconnect

			this._profiles[index] = prfl
		}
	}

	_callback(action: ProfileTypes.ProfileDispatch): void {
		switch (action.type) {
			case GlobalTypes.RESET:
				this._reset();
				break;

			case ProfileTypes.TRAVERSE:
				this._traverse(action.data.page);
				break;

			case ProfileTypes.FILTER:
				this._filterCallback(action.data.filter);
				break;

			case ProfileTypes.SYNC:
				this._sync(action.data.profiles, action.data.profilesSystem);
				this.emitChange();
				break;

			case ProfileTypes.SYNC_STATE:
				this._syncState(action.data.profilesState);
				this.emitChange();
				break;

			case ProfileTypes.SYNC_ALL:
				this._sync(action.data.profiles, action.data.profilesSystem);
				this._syncState(action.data.profilesState);
				this.emitChange();
				break;
		}
	}
}

export default new ProfilesStore();
