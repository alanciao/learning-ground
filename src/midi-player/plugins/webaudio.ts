import { IAudioPlugin } from './interfaces';

export class WebAudioPlugin implements IAudioPlugin {
  public readonly api = 'webAudio';
  private _ctx?:AudioContext;

  public async connect() {
    await this.setContext(this._ctx || this._createAudioContext());
  }

  public getContext() {
    return this._ctx;
  }

  public async setContext(context:AudioContext) {
    this._ctx = context;

    //
  }

  public setVolume(volume:number, delay:number = 0) {}

  public noteOn() {}

  public noteOff() {}

  public changeProgram() {}

  public pitchBend() {}

  private _createAudioContext() {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  }
}
