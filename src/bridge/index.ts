
import * as I from './interfaces';
import { dsBridge } from './core';

export class NativeBridge {
  private _bridge = dsBridge;
  private _currentState:I.State|undefined;
  private _currentHandler:I.Handler;
  private _currentListeners:I.Listener[];
  private _isHandling:boolean;

  constructor(handler:I.Handler) {
    if (typeof handler !== 'function') {
      throw new Error('Expected the rootHandler to be a function');
    }
    this._currentHandler = handler;
    this._currentListeners = [];
    this._isHandling = false;

    this._bridge.register('postMessage', this._onMessages.bind(this));
    this._bridge.registerAsyn('postMessageAsyn', this._onMessages.bind(this));
  }

  public getState() : I.State {
    if (this._isHandling) {
      throw new Error('Can\'t get state while handling an action.');
    }

    return this._currentState as I.State;
  }

  /**
   * Post message to native.
   *
   * @param type
   * @param payload
   * @param cb
   */
  public postMessage(type:string, payload:any = '', cb?:Function) {
    const arg = { type, payload };
    if (cb) {
      this._bridge.call('postMessageAsyn', arg, cb);
    } else {
      return this._bridge.call('postMessageSyn', arg);
    }
  }

  public dispatch(action:I.Action) {
    if (this._isHandling) {
      return JSON.stringify({ status: false, message: 'Bridge may not dispatch actions.' });
    }

    let ret;
    try {
      this._isHandling = true
      ret = this._currentHandler(this._currentState, action)
    } catch(e) {
      ret = JSON.stringify({ status: false, message: e && e.message });
    } finally {
      this._isHandling = false
    }

    // notify listeners

    return ret;
  }

  private _onMessages(type:string, payload:any, callback?:Function) {
    const action = this._parseAction(type, payload, callback);
    return this.dispatch(action);
  }

  private _parseAction(type:string, payload:any, callback?:Function) : I.Action {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      payload = null;
    }

    return { type, payload, callback };
  }
}
