import * as I from './interfaces';
import { AudioType, IAudioPlugin } from '../plugins/interfaces';
import { audioDetect } from './audioDetect';
import { getPlugin } from '../plugins';

declare const soundFont:any;

const DEFAULT_SOUND_FONT_BASE_URL = './soundfont/';

export class Loader {
  private _api?:AudioType;
  private _soundFontBaseUrl:string;
  private _instruments:string[];
  private _audioFormat?:I.AudioFormat;
  private _local?:boolean;

  private _supports?:I.AudioDetectSupports;
  private _isLoading:boolean = false;
  private _plugin?:IAudioPlugin;

  constructor(config:I.Configuration) {
    this._api = config.api;
    this._soundFontBaseUrl = config.soundFontBaseUrl || DEFAULT_SOUND_FONT_BASE_URL;
    this._instruments = config.instruments || ['acoustic_grand_piano'];
    this._audioFormat = config.targetFormat;
    this._local = config.local;
  }

  public getApi() {
    return this._api;
  }

  public async loadPlugin() : Promise<IAudioPlugin | undefined> {
    if (!this._isLoading) {
      this._isLoading = true;

      if (this._plugin) {
        await this._plugin.connect();
        this._isLoading = false;
        return this._plugin;
      }

      this._supports = await audioDetect();

      if (!this._api || !this._supports[this._api]) {
        if (this._supports['webMidi']) {
          this._api = 'webMidi';
        } else if (this._supports['webAudio']) {
          this._api = 'webAudio';
        } else if (this._supports['audioTag']) {
          this._api = 'audioTag';
        }
      }
      
      if (this._audioFormat) {
        this._audioFormat = this._supports.ogg ? 'ogg' : 'mp3';
      }

      this._plugin = getPlugin(this._api);
      if (this._plugin) {
        await this.loadResource(this._instruments);
        await this._plugin.connect();
        this._isLoading = false;
      } else {
        throw new Error('Cannot load suitable audio plugin.')
      }
      return this._plugin;
    }
  }

  public async loadResource(instruments:string[], onprogress?:Function) : Promise<void> {
    if (this._api === 'webMidi') {
      //
      return;
    }

    let count = 0;
    const total = instruments.length;
    const promiseQueue = instruments.map(async (instrumentName) => {
      if (soundFont[instrumentName]) {
        onprogress && onprogress({ total, count: ++count });
        return;
      }
      return this._requestResource().then(() => {
        onprogress && onprogress({ total, count: ++count });
      });
    });

    await Promise.all(promiseQueue);
  }

  private async _requestResource() : Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
