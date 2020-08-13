import { EventOptions } from '../../interfaces';

// TODO seems not support
export class WebMidi {
  public readonly api:string = 'webmidi';

  private _access:any;
  private _output:any;

  constructor() {}

  public connect(options:EventOptions) {
    (navigator as any).requestMIDIAccess().then((access:any) => {
      this._access = access;
      const pluginOutputs = access.outputs;
      if (typeof pluginOutputs === 'function') {
        this._output = pluginOutputs()[0];
      } else {
        this._output = pluginOutputs[0];
      }
      if (this._output === undefined) {
        options.onerror && options.onerror('Not support');
      } else {
        options.onsuccess && options.onsuccess();
      }
    });
  }
}
