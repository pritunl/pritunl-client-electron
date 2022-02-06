/// <reference path="../References.d.ts"/>
import * as Flux from 'flux';
import * as GlobalTypes from '../types/GlobalTypes';

class LoadingDispatcher extends Flux.Dispatcher<GlobalTypes.Dispatch> {}
export default new LoadingDispatcher();
