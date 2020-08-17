import { AudioType } from '../plugins/interfaces';

export type AudioFormat = 'ogg' | 'mp3';

export interface Configuration {
  api?:AudioType;
  targetFormat?:AudioFormat;
  soundFontBaseUrl?:string;
  instruments?:string[];
  local?:boolean;
}

export interface EventOptions {
  onsuccess?:Function;
  onerror?:Function;
}

export interface AudioDetectSupports {
  [key:string]:boolean;
}

