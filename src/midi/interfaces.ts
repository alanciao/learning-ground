export interface MidiHeader {
  formatType:number;
  trackCount:number;
  ticksPerBeat:number;
}

export interface MidiEvent {
  deltaTime:number;
  type:MidiEventType;
  subtype:MidiEventSubtype;

  number?:number;
  channel?:number;
  data?:string;
  text?:string;
  numerator?:number;
  denominator?:number;
  metronome?:number;
  thirtySeconds?:number;
  microsecondsPerBeat?:number;
  controllerType?:number;
  value?:number;
  programNumber?:number;
  key?:number;
  scale?:number;
  noteNumber?:number;
  velocity?:number;
  amount?:number;
  frameRate?:number;
  hour?:number;
  min?:number;
  sec?:number;
  frame?:number;
  subFrame?:number;
}

export type MidiTrack = MidiEvent[];
export type MidiEventType = 'channel' | 'meta' | 'sysEx' | 'dividedSysEx';
export type MidiTemporal = [NextEvent, number][];

export enum MidiEventSubtype {
  UNKNOWN = 'unknown',
  SEQUENCE_NUMBER = 'sequenceNumber',
  TEXT = 'text',
  COPYRIGHT_NOTICE = 'copyrightNotice',
  TRACK_NAME = 'trackName',
  INSTRUMENT_NAME = 'instrumentName',
  LYRICS = 'lyrics',
  MARKER = 'marker',
  CUE_POINT = 'curPoint',
  MIDI_CHANNEL_PREFIX = 'midiChannelPrefix',
  END_OF_TRACK = 'endOfTrack',
  SET_TEMPO = 'setTempo',
  SMPTE_OFFSET = 'smpteOffset',
  TIME_SIGNATURE = 'timeSignature',
  KEY_SIGNATURE = 'keySignature',
  SEQUENCER_SPECIFIC = 'sequencerSpecific',

  NOTE_OFF = 'noteOff',
  NOTE_ON = 'noteOn',
  NOTE_AFTER_TOUCH = 'noteAfterTouch',
  CONTROLLER = 'controller',
  PROGRAM_CHANGE = 'programChange',
  CHANNEL_AFTER_TOUCH = 'channelAfterTouch',
  PITCH_BEND = 'pitchBend',
}

export interface TrackStates {
  nextEventIndex:number;
  ticksToNextEvent:number;
}

export interface NextEvent {
  ticksToEvent:number | undefined;
  event:MidiEvent;
  track:number;
}

export interface EventOptions {
  onsuccess?:Function;
  onprogress?:Function;
  onerror?:Function;
}

export interface AudioDetectSupports {
  webmidi?:boolean;
  audiotag?:boolean;
  webaudio?:boolean;
  [mime:string]:boolean | undefined;
}

export interface Options {
  soundFontBaseUrl?:string;
  instruments?:(string | number)[];
  api?:string;
  targetFormat?:string;
  local?:boolean;
}
