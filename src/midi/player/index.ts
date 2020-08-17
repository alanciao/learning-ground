import * as I from './interfaces';
import { IAudioPlugin } from '../plugins/interfaces';
import { NextEvent, MidiMatrix } from '../analyser/interfaces';
import { MidiChannelEventType } from '../parser/interfaces';
import { Loader } from './loader';
import { MidiAnalyser } from '../analyser';
import { MidiFileParser } from '../parser'


export class Player {
  private _loader:Loader;
  private _parser:MidiFileParser;
  private _analyser:MidiAnalyser;

  private _ctx?:IAudioPlugin;
  private _data?:NextEvent[];
  private _ticker:any;

  // control
  private _timeWarp:number = 1;
  private _currentTick:number = 0;
  private _playing:boolean = false;
  private _onMidiStart?:Function;

  constructor(config?:I.Configuration) {
    this._loader = new Loader(config || {});
    this._parser = new MidiFileParser();
    this._analyser = new MidiAnalyser();
  }

  /* load file */
  public loadBase64File(file:string, options?:I.EventOptions) {
    this.stop();
    if (file.indexOf('base64,') !== -1) {
      const data = window.atob(file.split(',')[1]);
      this._analyser.analyseMidiFile(this._parser.parse(data));
      this._loadPlugin(options || {});
    }
  }

  public loadMatrix(matrix:MidiMatrix, options?:I.EventOptions) {
    this._analyser.analyseMidiMatrix(matrix);
    this._loadPlugin(options || {});
  }

  /* control apis */
  public setProgram(program:number) {
    this._ctx && this._ctx.changeProgram(0, program);
  }

  public setSpeed(val?:number) {
    val = val || 1;
    if (val < 0) { val = 1; }
    this._timeWarp = 1 / val;
  }

  public getNotes(column:number) {}

  public getBeatPerMinutes() {
    return this._analyser.getBPM() / this._timeWarp;
  }

  public addStartListener(listener:Function) {
    this._onMidiStart = listener;
  }

  public removeStartListener() {
    this._onMidiStart = undefined;
  }

  public getTickTime() {
    return this._analyser.getTickTime();
  }

  public isPlaying() {
    return this._playing;
  }

  /* play controls */
  public start(start:number = 0, end?:number) {
    if (this._playing) { return; }
    this._playing = true;
    this._data = this._analyser.getData(start, end);
    this._ticker = setInterval(this._playAudio.bind(this), this.getTickTime());
    this._onMidiStart && this._onMidiStart();
  }

  public stop() {
    this._playing = false;
    clearInterval(this._ticker);
    this._ticker = undefined;
    this._data = undefined;
    this._currentTick = 0;
  }

  private _loadPlugin(options:I.EventOptions) {
    const { onsuccess, onerror } = options;
    this._loader.loadPlugin().then((plugin) => {
      this._ctx = plugin;
      onsuccess && onsuccess();
    }).catch((err) => {
      onerror && onerror(err);
    });
  }

  private _playAudio() {
    if (!this._ctx || !this._data || this._data.length === 0) {
      this.stop();
      return;
    }
    this._currentTick++;
    const obj = this._data[0];
    const ticks = obj.ticksToEvent * this._timeWarp;
    if (this._currentTick < ticks) { return; }

    const event = obj.event;
    if (event.type === 'channel') {
      const channelId = event.channel || 0;
      const note = event.noteNumber || 0;
      switch (event.subtype) {
        case MidiChannelEventType.PROGRAM_CHANGE:
          this._ctx.changeProgram(channelId, event.value);
          break;
        case MidiChannelEventType.NOTE_ON:
          this._ctx.noteOn(channelId, note, event.velocity);
          break;
        case MidiChannelEventType.NOTE_OFF:
          this._ctx.noteOff(channelId, note);
          break;
        default:
          // console.log('Other events are not supported.', event);
          break; 
      }

      this._currentTick = 0;
    }

    this._data.shift();
  }
}
