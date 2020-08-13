import { MidiFileParser } from '../../midi-player/parser';
import { Replayer } from './replayer';
import { PluginLoader } from './loader';
import { MidiTemporal, Options, MidiEventSubtype } from '../interfaces';
import { GM } from './gm';

export { GM } from './gm';

export class Player {
  public readonly loader:PluginLoader;

  private _currentData:string = '';
  private _replayer?:Replayer;
  private _data:MidiTemporal = [];

  private _timeWarp:number = 1;
  private _bpm:number = 120;
  private _currentTime:number = 0;
  private _startTime:number = 0;
  private _endTime:number = 0;
  private _restart:number = 0;
  private _playing:boolean = false;
  private _startDelay:number = 0;
  private _forceChanel:number = -1;

  private _eventQueue:any = [];
  private _queuedTime:number = 0;
  private _noteRegistry:any = {};
  private _onMidiEvent?:Function;

  constructor(options:Options) {
    this.loader = new PluginLoader(options);
  }

  public loadBase64File(file:string, onsuccess?:Function, onerror?:Function, onprogress?:Function) {
    this.stop();
    if (file.indexOf('base64,') === -1) {
      throw new Error('Only base64 is supported');
    }

    this._currentData = window.atob(file.split(',')[1]);
    this.loadMidiFile(onsuccess, onerror, onprogress);
  }

  public setSpeed(val:number) {
    this._timeWarp = 1 / val;
    if (this._playing) {
      this.pause();
      this.resume();
    }
  }

  public changeProgram(val:number) {
    this._forceChanel = val || -1;
    if (this._playing) {
      this.pause();
      this.resume();
    }
  }

  private loadMidiFile(onsuccess?:Function, onerror?:Function, onprogress?:Function) {
    try {
      this._replayer = new Replayer(new MidiFileParser().parse(this._currentData), this._timeWarp, this._bpm);
      this._data = this._replayer.getData();
      this._endTime = this._getLength();
      this.loader.loadResource({ onsuccess, onerror, onprogress });
    } catch (error) {
      onerror && onerror(error);
    }
  }

  public start(onsuccess?:Function) {
    if (this._currentTime < -1) {
      this._currentTime = -1;
    }
    this._startAudio(this._currentTime, undefined, onsuccess);
  }

  public stop() {
    this._stopAudio();
    this._restart = 0;
    this._currentTime = 0;
  }

  public pause() {
    const tmp = this._restart;
    this._stopAudio();
    this._restart = tmp;
  }

  public resume(onsuccess?:Function) {
    this.start(onsuccess);
  }

  public addListener(listener:Function) {
    this._onMidiEvent = listener;
  }

  public removeListener() {
    this._onMidiEvent = undefined;
  }

  private _getLength() {
    const data = this._data;
    const length = data.length;
    let totalTime = 0.5;
    for (let i = 0; i < length; i++) {
      totalTime += data[i][1];
    }

    return totalTime;
  }

  private _scheduleTracking(channel:number, note:number, currentTime:number, offset:number, message:number, velocity:number) {
    return setTimeout(
      () => {
        const data = {
          channel,
          note,
          now: currentTime,
          end: this._endTime,
          message,
          velocity,
        };
        if (message === 128) {
          delete this._noteRegistry[note];
        } else {
          this._noteRegistry[note] = data;
        }
        this._onMidiEvent && this._onMidiEvent(data);
        this._currentTime = currentTime;
        this._eventQueue.shift();

        if (this._eventQueue.length < 1000) {
          this._startAudio(this._queuedTime, true);
        } else if (this._currentTime === this._queuedTime && this._queuedTime < this._endTime) {
          // grab next sequence
          this._startAudio(this._queuedTime, true);
        }
      },
      currentTime - offset,
    );
  }

  private _startAudio(currentTime:number, fromCache?:any, onsuccess?:Function) {
    if (!this._replayer) { return; }

    if (!fromCache) {
      if (typeof currentTime === 'undefined') {
        currentTime = this._restart;
      }
      this._playing && this._stopAudio();
      this._playing = true;
      this._data = this._replayer.getData();
      this._endTime = this._getLength();
    }

    let note;
    let offset = 0;
    let messages = 0;
    let data = this._data;
    let ctx = this.loader.getContext();
    let length = data.length;

    this._queuedTime = 0.5;

    const foffset = currentTime - this._currentTime;
    this._startTime = ctx.currentTime;

    for (let i = 0; i < length && messages < 100; i++) {
      const obj = data[i];
      this._queuedTime += obj[1] * this._timeWarp;
      if (this._queuedTime <= currentTime) {
        offset = this._queuedTime;
        continue;
      }
      currentTime = this._queuedTime - offset;

      const event = obj[0].event;
      if (event.type !== 'channel') { continue; }

      const channelId = this._forceChanel === -1 ? (event.channel || 0) : (event.channel || 0) > 5 ? (event.channel || 0) : this._forceChanel;
      const channel = GM.channel[channelId];
      const delay = ctx.currentTime + ((currentTime + foffset + this._startDelay) / 1000);
      const queueTime = this._queuedTime - offset + this._startDelay;

      switch (event.subtype) {
        case MidiEventSubtype.CONTROLLER:
          this.loader.ctx.setController(channelId, event.controllerType, event.value, delay);
          break;
        case MidiEventSubtype.PROGRAM_CHANGE:
          this.loader.ctx.programChange(channelId, event.programNumber, delay);
          break;
        case MidiEventSubtype.PITCH_BEND:
          this.loader.ctx.pitchBend(channelId, event.value, delay);
          break;
        case MidiEventSubtype.NOTE_ON:
          if (channel.mute) { break; }
          note = event.noteNumber || 0;
          this._eventQueue.push({
            event,
            time: queueTime,
            source: this.loader.ctx.noteOn(channelId, note, event.velocity, delay),
            interval: this._scheduleTracking(channelId, note, this._queuedTime + this._startDelay, offset - foffset, 144, event.velocity || 0),
          });
          messages++;
          break;
        case MidiEventSubtype.NOTE_OFF:
          if (channel.mute) { break; }
          note = event.noteNumber || 0;
          this._eventQueue.push({
            event,
            time: queueTime,
            source: this.loader.ctx.noteOff(channelId, note, delay),
            interval: this._scheduleTracking(channelId, note, this._queuedTime, offset - foffset, 128, 0),
          });
          break;
        default:
          break; 
      }
    }

    onsuccess && onsuccess(this._eventQueue);
  }

  private _stopAudio() {
    const ctx = this.loader.getContext();
    this._playing = false;
    this._restart += (ctx.currentTime - this._startTime) * 1000;
    // stop the audio, and intervals
    while (this._eventQueue.length) {
      const e = this._eventQueue.pop();
      clearInterval(e.interval);
      if (!e.source) continue;
      if (typeof e.source === 'number') {
        clearTimeout(e.source);
      } else {
        // webaudio
        e.source.disconnect(0);
      }
    }

    // run callback to cancel any notes still playing
    for (const key in this._noteRegistry) {
      const o = this._noteRegistry[key];
      if (o.message === 144 && this._onMidiEvent) {
        this._onMidiEvent({
          channel: o.channel,
          note: o.note,
          now: o.now,
          end: o.end,
          message: 128,
          velocity: o.velocity,
        });
      }
    }

    // reset noteRegistry
    this._noteRegistry = {};
  }
}
