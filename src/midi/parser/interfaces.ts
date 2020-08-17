export type BinaryString = string;

export interface MidiFile {
  header:MidiHeader;
  tracks:MidiTrack[];
}

export interface MidiHeader {
  formatType:number;
  trackCount:number;
  ticksPerBeat:number
  frame?:number;
}

export type MidiTrack = MidiEvent[];
export type MidiEvent = MidiChannelEvent | MidiMetaEvent | MidiSysExEvent;
export type MidiEventType = 'channel' | 'meta' | MidiSysExEventType;

export type MidiSysExEventType = 'sysEx' | 'sysEsc';
export interface MidiSysExEvent {
  deltaTime:number,
  type:MidiSysExEventType;
  length:number;
  data:string;
}

export enum MidiMetaEventType {
  SEQUENCE_NUMBER = 'sequenceNumber',         // at the very beginning
  TEXT = 'text',
  COPYRIGHT_NOTICE = 'copyrightNotice',
  TRACK_NAME = 'trackName',
  INSTRUMENT_NAME = 'instrumentName',
  LYRICS = 'lyrics',
  MARKER = 'marker',
  CUE_POINT = 'cuePoint',
  MIDI_CHANNEL_PREFIX = 'midiChannelPrefix',
  MIDI_PORT_PREFIX = 'midiPortPrefix',
  END_OF_TRACK = 'endOfTrack',
  SET_TEMPO = 'setTempo',
  SMPTE_OFFSET = 'SMPTEOffset',
  TIME_SIGNATURE = 'timeSignature',
  KEY_SIGNATURE = 'keySignature',
  SEQUENCER_SPECIFIC = 'sequencerSpecific',
  UNKNOWN = 'unknown',
}

export type MidiMetaEvent = MidiMetaBaseEvent &
    ValueField &
    TextField &
    ParamsField &
    DataField;
interface MidiMetaBaseEvent {
  deltaTime:number,
  type:'meta',
  subtype:MidiMetaEventType,
}
interface ValueField {
  value:number;
}
interface TextField {
  text:string;
}
interface DataField {
  data:string;
}
interface ParamsField {
  params:KeySignatureParams | TimeSignatureParams | SMPTEOffsetParams;
}
interface KeySignatureParams {
  key:number;
  scale:number;
}
interface TimeSignatureParams {
  numerator:number; // 分子
  denominator:number; // 分母
  metronome:number;
  thirtySeconds:number;
}
interface SMPTEOffsetParams {
  frameRate:number;
  hours:number;
  minutes:number;
  seconds:number;
  frame:number;
  subFrame:number;
}

export enum MidiChannelEventType {
  NOTE_OFF = 'noteOff',                        // 松开音符
  NOTE_ON = 'noteOn',                          // 按下音符
  NOTE_AFTER_TOUCH = 'noteAfterTouch',         // 触后音符
  CONTROLLER = 'controller',                   // 控制器
  PROGRAM_CHANGE = 'programChange',            // 改变乐器
  CHANNEL_AFTER_TOUCH = 'channelAfterTouch',   // 触后通道
  PITCH_BEND = 'pitchBend',                    // 滑音
}
export type MidiChannelEvent = MidiChannelBaseEvent &
    NoteField &
    ControllerField &
    ValueField;
interface MidiChannelBaseEvent {
  deltaTime:number,
  type:'channel',
  subtype:MidiChannelEventType,
  channel:number,
}
interface NoteField {
  noteNumber:number;
  velocity:number;
}
interface ControllerField {
  controller:number;
  value:number;
}
