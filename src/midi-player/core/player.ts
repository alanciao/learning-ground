import { Configuration, EventOptions } from './interfaces';
import { MidiFile } from '../parser/interfaces';
import { MidiFileParser } from '../parser';
import { Loader } from './loader';
import { MidiAnalyser } from './analyser';

export class Player {
  private _loader:Loader;
  private _parser:MidiFileParser;
  private _analyser?:MidiAnalyser;

  // control
  private _timeWarp:number = 1;
  private _currentTime:number = 0;
  private _startTime:number = 0;
  private _endTime:number = 0;

  private _playing:boolean = false;

  constructor(config?:Configuration) {
    this._loader = new Loader(config || {});
    this._parser = new MidiFileParser();
  }

  public loadBase64File(file:string, options?:EventOptions) {
    this.stop();
    if (file.indexOf('base64,') !== -1) {
      const data = window.atob(file.split(',')[1]);
      this._loadMidiFile(this._parser.parse(data), options || {})
    }
  }

  public getApi() {
    return this._loader.getApi();
  }

  public setSpeed(val?:number) {
    val = val || 1;
    if (val < 0) { val = 1; }
    this._timeWarp = 1 / val;
  }

  public setProgram(program:number) {}

  public start() {
    if (this._currentTime < -1) {
      this._currentTime = -1;
    }
    this._startAudio(this._currentTime);
  }

  public stop() {}

  public pause() {}

  public resume() {}

  private _loadMidiFile(midiFile:MidiFile, options:EventOptions) {
    // analyse midi events
    this._analyser = new MidiAnalyser(midiFile);

    const { onsuccess, onprogress, onerror } = options;
    this._loader.loadPlugin().then(() => {
      onsuccess && onsuccess();
    }).catch((err) => {
      onerror && onerror(err);
    });
  }

  private _startAudio(currentTime:number, fromCache?:boolean) {
    if (!this._analyser) { return; }
    if (!fromCache) {
      this._playing = true;
      
    }
  }
}
