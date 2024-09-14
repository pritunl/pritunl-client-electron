/// <reference path="../References.d.ts"/>
import DispatcherBase from "./Base";
import * as GlobalTypes from '../types/GlobalTypes';

class EventDispatcher extends DispatcherBase<GlobalTypes.Dispatch> {}
export default new EventDispatcher();
