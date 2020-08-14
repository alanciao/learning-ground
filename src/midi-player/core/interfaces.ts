import { AudioType } from '../plugins/interfaces';
import { MidiEvent } from '../parser/interfaces';

export interface Configuration {
  api?:AudioType;
  targetFormat?:AudioFormat;
  soundFontBaseUrl?:string;
  instruments?:string[];
  local?:boolean;
}

export interface EventOptions {
  onsuccess?:Function;
  onprogress?:Function;
  onerror?:Function;
}

export interface AudioDetectSupports {
  [key:string]:boolean;
}

export type AudioFormat = 'ogg' | 'mp3';
export type SoundFont = {[id:string]:{[key:string]:string}}

export interface Channels {
  [index:number]:Channel;
}

export interface Channel {
  instrument:number;
  pitchBend:number;
  mute:boolean;
  mono:boolean;
  omni:boolean;
  solo:boolean;
}

export interface GMInstruments {
  byId:{[id:number]:GMInstrument};
  byName:{[name:string]:GMInstrument};
}

export interface GMInstrument {
  id:number;
  name:string;
  category:string;
}

export interface TrackStates {
  nextEventIndex:number;
  ticksToNextEvent:number;
}

export interface NextEvent {
  ticksToEvent:number;
  event:MidiEvent;
  track:number;
}
