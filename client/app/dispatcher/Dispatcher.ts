/// <reference path="../References.d.ts"/>
import * as Flux from 'flux';
import * as GlobalTypes from '../types/GlobalTypes';

class Dispatcher extends Flux.Dispatcher<GlobalTypes.Dispatch> {}
export default new Dispatcher();
