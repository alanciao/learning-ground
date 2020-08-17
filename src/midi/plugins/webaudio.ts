import { IAudioPlugin } from './interfaces';
import { GM } from '../core';

declare const soundFont:any;

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
    const notes = GM.getKeyToNote();
    const urls = Object.keys(notes);
    
    const waitForEnd = (instrument?:string) => {
      for (const key in bufferPending) {
        if (bufferPending[key]) return;
      }

      // if (onload) { // run onload once
      //   onload();
      //   onload = undefined;
      // }
    };

    const requestAudio = (soundfont:any, instrumentId:number, index:number, key:string) => {
      const url = soundfont[key];
      if (!url) { return; }

      bufferPending[instrumentId]++;
      this._loadAudio(url, (buffer:any) => {
        buffer.id = key;
        const noteId = GM.getKeyToNote()[key];
        this._audioBuffers[`${instrumentId}${noteId}`] = buffer;
        if (--bufferPending[instrumentId] === 0) {
          soundfont.isLoaded = true;
          waitForEnd();
        }
      });
    };

    const bufferPending = {} as any;
    for (const instrument in soundFont) {
      const soundfont = soundFont[instrument];
      if (soundfont.isLoaded) {
        return;
      }

      // Load soundfont
      const synth = GM.getInstrumentByName(instrument);
      const instrumentId = synth.id;
      bufferPending[instrumentId] = 0;
      urls.forEach((key, index) => {
        requestAudio(soundfont, instrumentId, index, key);
      });
    }

    setTimeout(waitForEnd, 1);
  }

  private _loadAudio(url:string, onload?:any, onerror?:any) {
    if (!this._ctx) {
      onload && onload();
      return;
    }
    // Base64 string
    const base64 = url.split(',')[1];
    const buffer = Base64Binary.decodeArrayBuffer(base64);
    this._ctx.decodeAudioData(buffer, onload, onerror);
  }

  public setVolume(volume:number, delay:number = 0) {}

  private _audioBuffers:any = [];
  private _masterVolume = 127;
  private _sources:any = [];
  public noteOn(channelId:number, noteId:number, velocity:number, delay:number = 0) {
    // check whether the note exists
    const channel = GM.getChannel(channelId);
    const instrument = channel.instrument;
    const bufferId = `${instrument}${noteId}`;
    const buffer = this._audioBuffers[bufferId];
    if (!buffer || !this._ctx) { return; }

		// convert relative delay to absolute delay
    if (delay < this._ctx.currentTime) {
      delay += this._ctx.currentTime;
    }

    // create audio buffer
    const source = this._ctx.createBufferSource() as any;
    source.buffer = buffer;
    
    // add effects to buffer
    const gain = (velocity / 127) * (this._masterVolume / 127) * 2 - 1
    source.connect(this._ctx.destination);
    source.playbackRate.value = 1; // pitch shift
    source.gainNode = this._ctx.createGain(); // gain
    source.gainNode.connect(this._ctx.destination);
    source.gainNode.gain.value = Math.min(1.0, Math.max(-1.0, gain));
    source.connect(source.gainNode);

    source.start(delay || 0);
    this._sources[`${channelId}${noteId}`] = source;

    return source;
  }

  public noteOff() {}

  public changeProgram() {}

  public pitchBend() {}

  private _createAudioContext() {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  }
}
