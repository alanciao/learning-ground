
import * as I from './interfaces';
import { dsBridge } from './core';

export class NativeBridge {
  protected _bridge = dsBridge;
  private _currentState:any;
  private _currentHandler:I.Handler;

  constructor(rootHandler:I.Handler) {
    if (typeof rootHandler !== 'function') {
      throw new Error('Expected the rootHandler to be a function');
    }
    this._currentHandler = rootHandler;
    this._bridge.register('postMessage', this.onSyncMessages);
    this._bridge.registerAsyn('postMessageAsyn', this.onAsyncMessages);
  }

  public getState() : any {
    return this._currentState;
  }

  public postMessage(type:string, payload:any = '', cb?:Function) : any {
    const arg = { type, payload };
    if (cb) {
      this._bridge.call('postMessageAsyn', arg, cb);
    } else {
      return this._bridge.call('postMessageSyn', arg);
    }
  }

  private onSyncMessages = (type:string, payload:any) => {
    const action = this.parseAction(type, payload);

    try {
      const result = this._currentHandler(action);
      return result !== undefined ? result : JSON.stringify({ status: true, message: 'success' });
    } catch (e) {
      return JSON.stringify({ status: false, message:e && e.message });
    }
  }

  private onAsyncMessages = async (type:string, payload:any, cb:Function) => {
    const action = this.parseAction(type, payload);

    try {
      const result = await this._currentHandler(action);
      cb(result);
    } catch (e) {
      cb(JSON.stringify({ status: false, message: e && e.message }));
    }
  }

  private parseAction(type:string, payload:any) : I.Action {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      payload = null;
    }

    return { type, payload };
  }
}
