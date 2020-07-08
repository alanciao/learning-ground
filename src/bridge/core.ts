const global = window as any;

class DsBridge {
  private _dscb = new Map<string, string>();

  constructor() {
    if (global._dsf) { return; }

    this._registerGlobal();

    this.register('_hasJavascriptMethod', (method:string) => {
      const [namespace, m] = this._parseMethod(method);
      if (!namespace) {
        return !!(global._dsf[m] || global._dsaf[m]);
      }
      // with namespace
      const obj = global._dsf._obs[namespace] || global._dsaf._obs[namespace];
      return obj && !!obj[m];
    });
  }

  private _registerGlobal() {
    global._dsf = { _obs: {} };
    global._dsaf = { _obs: {} };
    global.dscb = 0;
    global.dsBridge = this;
    global.close = () => {
      this.call('_dsb.closePage');
    };
    global._handleMessageFromNative = (info:{method:string, data:string, callbackId:number}) => {
      const arg = JSON.parse(info.data);
      const ret:{id:number, data?:any, complete:boolean} = {
        id: info.callbackId,
        complete: true,
      };

      const callSyn = (func:Function, ob:object) => {
        ret.data = func.apply(ob, arg);
        this.call('_dsb.returnValue', ret);
      };
      const callAsyn = (func:Function, ob:object) => {
        arg.push((data:any, complete?:boolean) => {
          ret.data = data;
          ret.complete = complete !== false;
          this.call('_dsb.returnValue', ret);
        });
        func.apply(ob, arg);
      };

      const f = global._dsf[info.method];
      const af = global._dsaf[info.method];
      if (f) {
        callSyn(f, global._dsf);
      } else if (af) {
        callAsyn(af, global._dsaf);
      } else {
        // with namespace
        const [namespace, method] = this._parseMethod(info.method);
        if (!namespace) { return; }
        let obs = global._dsf._obs;
        let obj = obs[namespace] || {};
        let m = obj[method];
        if (m && typeof m === 'function') {
          callSyn(m, obj);
          return;
        }

        obs = global._dsaf._obs;
        obj = obs[namespace] || {};
        m = obj[method];
        if (m && typeof m === 'function') {
          callAsyn(m, obj);
          return;
        }
      }
    };
  }

  public call(method:string, args?:any, cb?:Function) : any {
    if (typeof args === 'function') {
      cb = args;
      args = {};
    }
    const arg:{data:any, _dscbstub?:string} = {
      data: args === undefined ? null : args,
    };
    if (typeof cb === 'function') {
      const cbName = this._dscb.get(method) || 'dscb' + global.dscb++;
      global[cbName] = cb;
      arg._dscbstub = cbName;
      this._dscb.set(method, cbName);
    }
    const argString = JSON.stringify(arg);

    let ret;
    if (global._dsbridge) {
      ret = global._dsbridge.call(method, arg);
    } else if (global._dswk || navigator.userAgent.indexOf('_dsbridge') !== -1) {
      ret = prompt('_dsbridge=' + method, argString);
    }

    return JSON.parse(ret || '{}').data;
  }

  public register(name:string, func:Function|object, async:boolean = false) : void {
    const obj = async ? global._dsaf : global._dsf;
    if (!global._dsInit) {
      global._dsInit = true;
      setTimeout(() => this.call('_dsb.dsinit'), 0);
    }
    if (typeof func === 'object') {
      obj._obs[name] = func;
    } else {
      obj[name] = func;
    }
  }

  public registerAsyn(name:string, func:Function) : void {
    this.register(name, func, true);
  }

  public hasNativeMethod(name:string, type:string = 'all') : boolean {
    return this.call('_dsb.hasNativeMethod', { name, type });
  }

  public disableJavascriptDialogBlock(disable:boolean = true) : void {
    this.call('_dsb.disableJavascriptDialogBlock', { disable });
  }

  private _parseMethod(method:string) : [string, string] {
    const name = method.split('.');
    if (name.length < 2) { return ['', name[0]]; }
    return [name.pop() || '', name.join('.')];
  }
}

export const dsBridge = new DsBridge();
