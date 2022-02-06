/// <reference path="../References.d.ts"/>
import * as Flux from 'flux';
import * as GlobalTypes from '../types/GlobalTypes';

class EventDispatcher extends Flux.Dispatcher<GlobalTypes.Dispatch> {}
export default new EventDispatcher();
