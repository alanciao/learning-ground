import { Options, EventOptions, AudioDetectSupports } from '../interfaces';
import { audioDetect, localScriptLoader } from '../utils';
import { SoundFont } from '../soundfont';
import { plugins } from './plugins';

const DEFAULT_SOUND_FONT_BASE_URL = './soundfont/';

export class PluginLoader {
  public readonly soundFontBaseUrl?:string;
  public ctx:any;

  private _api:string = '';
  private _audioFormat:string = 'mp3';
  private _supports:AudioDetectSupports = {};
  private _instruments:string[] = ['acoustic_grand_piano'];
  private _local:boolean = true;

  private _init:boolean = false;
  private _context:any = { currentTime: 0 };

  constructor(options:Options) {
    this.soundFontBaseUrl = options.soundFontBaseUrl || DEFAULT_SOUND_FONT_BASE_URL;
    this._local = !!options.local;
    audioDetect((supports:AudioDetectSupports) => {
      this._supports = supports;
      if (options.api && supports[options.api]) {
        this._api = options.api;
      } else if (supports.webmidi) {
        this._api = 'webmidi';
      } else if (window.AudioContext) {  // Chrome
        this._api = 'webaudio';
      } else if (window.Audio) {  // Firefox
        this._api = 'audiotag';
      }

      // use audio/ogg when supported
      this._audioFormat = options.targetFormat || (supports['audio/ogg'] ? 'ogg' : 'mp3');
      if (options.instruments) {
        const instruments:string[] = [];
        options.instruments.forEach((instrument) => {
          if (typeof instrument === 'number') {
            console.log('number instrument ', instrument);
            return;
          }
          instruments.push(instrument);
        });
        this._instruments = instruments;
      }

      this._init = true;
    });
  }

  public getApi() {
    return this._api;
  }

  public getContext() {
    return this._context;
  }

  public loadResource(options:EventOptions) {
    if (!this._init) {
      setTimeout(() => this.loadResource(options), 0);
      return;
    }

    const getContext = plugins[this._api];
    if (!getContext) { return; }

    if (this._api === 'webmidi') {
      getContext().connect(options);
      return;
    }

    const { onprogress, onerror } = options;
    const length = this._instruments.length;
    let pending = length;
    const waitForEnd = () => {
      if (!--pending) {
        onprogress && onprogress('load', 1.0);
         this.ctx = getContext().connect(options);
        if (this._api === 'webaudio') {
          this._context = this.ctx.getContext();
        }
      }
    };

    this._instruments.forEach((instrumentId) => {
      if (SoundFont[instrumentId]) {
        waitForEnd();
      } else {
        this._sendRequest(instrumentId, {
          onprogress: () => {},
          onsuccess: waitForEnd,
          onerror: options.onerror,
        });
      }
    });
  }

  private _sendRequest(instrumentId:string, options:EventOptions) {
    const soundFontPath = `${this.soundFontBaseUrl}${instrumentId}-${this._audioFormat}.js`;
    if (this._local) {
      localScriptLoader.add({
        url: soundFontPath,
        onerror: options.onerror,
        onsuccess: options.onsuccess,
      });
    } else {
      throw new Error('Load from url is not supported yet');
    }
  }
}
