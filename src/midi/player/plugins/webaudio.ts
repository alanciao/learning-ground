import { EventOptions } from '../../interfaces';
import { GM } from '../gm';
import { SoundFont } from '../../soundfont';

declare const Base64Binary:any;

export class WebAudio {
  public readonly api:string = 'webaudio';

  private _ctx?:AudioContext;
  private _audioContext?:AudioContext = undefined;
  private _useStreamingBuffer = false;
  private _audioBuffers:any = {};

  private _sources:any = {};
  private _masterVolume:number = 127;
  
  public noteOn(channelId:number, noteId:number, velocity:number, delay:number = 0) {
    // check whether the note exists
    const channel = GM.channel[channelId];
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

  public noteOff(channelId:number, noteId:number, delay:number = 0) {
    // check whether the note exists
    const channel = GM.channel[channelId];
    const instrument = channel.instrument;
    const bufferId = `${instrument}${noteId}`;
    const buffer = this._audioBuffers[bufferId];
    if (!buffer || !this._ctx) { return; }

    if (delay < this._ctx.currentTime) {
      delay += this._ctx.currentTime;
    }

    const source = this._sources[`${channelId}${noteId}`];
    if (!source) { return; }

    if (source.gainNode) {
      // @Miranet: 'the values of 0.2 and 0.3 could of course be used as 
      // a 'release' parameter for ADSR like time settings.'
      // add { 'metadata': { release: 0.3 } } to soundfont files
      const gain = source.gainNode.gain;
      gain.linearRampToValueAtTime(gain.value, delay);
      gain.linearRampToValueAtTime(-1.0, delay + 0.3);
    }
    if (source.noteOff) {
      source.noteOff(delay + 0.5);
    } else {
      source.stop(delay + 0.5);
    }
    delete this._sources[`${channelId}${noteId}`];

    return source;
  }

  public setController(channelId:number, type:number, value:number, delay:number = 0) {}

  public programChange(channelId:number, program:any, delay:number = 0) {
    var channel = GM.channel[channelId];
		channel.instrument = program;
  }

  public pitchBend(channelId:number, program:any, delay:number= 0) {
    const channel = GM.channel[channelId];
    channel.pitchBend = program;
  }

  public setVolume(channelId:number, volume:number, delay:number = 0) {
    if (delay) {
      setTimeout(() => { this._masterVolume = volume }, delay * 1000);
    } else {
      this._masterVolume = volume;
    }
  }

  public connect(options:EventOptions) {
    this.setContext(this._ctx || this._createAudioContext(), options.onsuccess);
    return this;
  }

  public setContext(newCtx:any, onload?:Function, onprogress?:Function, onerror?:Function) {
    this._ctx = newCtx;

    const notes = GM.keyToNote;
    const urls = Object.keys(notes);
    
    const waitForEnd = (instrument?:string) => {
      for (const key in bufferPending) {
        if (bufferPending[key]) return;
      }

      if (onload) { // run onload once
        onload();
        onload = undefined;
      }
    };

    const requestAudio = (soundfont:any, instrumentId:string, index:number, key:string) => {
      const url = soundfont[key];
      if (!url) { return; }

      bufferPending[instrumentId]++;
      this._loadAudio(url, (buffer:any) => {
        buffer.id = key;
        const noteId = GM.keyToNote[key];
        this._audioBuffers[`${instrumentId}${noteId}`] = buffer;
        if (--bufferPending[instrumentId] === 0) {
          soundfont.isLoaded = true;
          waitForEnd();
        }
      });
    };

    const bufferPending = {} as any;
    for (const instrument in SoundFont) {
      const soundfont = SoundFont[instrument];
      if (soundfont.isLoaded) {
        return;
      }

      // Load soundfont
      const synth = GM.byName[instrument];
      const instrumentId = synth.number;
      bufferPending[instrumentId] = 0;
      urls.forEach((key, index) => {
        requestAudio(soundfont, instrumentId, index, key);
      });
    }

    setTimeout(waitForEnd, 1);
  }

  public getContext() {
    return this._ctx;
  }

  private _loadAudio(url:string, onload?:any, onerror?:any) {
    if (!this._ctx) {
      onload && onload();
      return;
    }
    if (this._useStreamingBuffer) {
      //
    } else if (url.indexOf('data:audio') === 0) {
      // Base64 string
      const base64 = url.split(',')[1];
      const buffer = Base64Binary.decodeArrayBuffer(base64);
      this._ctx.decodeAudioData(buffer, onload, onerror);
    } else {
      // url
    }
  }

  private _createAudioContext() {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  }
}
