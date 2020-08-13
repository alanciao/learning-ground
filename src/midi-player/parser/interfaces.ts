export type BinaryString = string;

export interface MidiHeader {
  formatType:number;
  trackCount:number;
  ticksPerBeat:number;
}

export type MidiTrack = MidiEvent[];
export type MidiEvent = ChannelEvent & MetaEvent & SystemEvent;
export type MidiEventType = 'channel' | 'meta' | 'sysEx' | 'dividedSysEx';
export enum MidiEventSubtype {
  // meta event
  SEQUENCE_NUMBER = 'sequenceNumber',          // 设置轨道音序
  TEXT = 'text',                               // 歌曲备注
  COPYRIGHT_NOTICE = 'copyrightNotice',        // 版权信息
  TRACK_NAME = 'trackName',                    // 音轨文本
  INSTRUMENT_NAME = 'instrumentName',          // 乐器名称
  LYRICS = 'lyrics',                           // 歌词
  MARKER = 'marker',                           // 标记
  CUE_POINT = 'curPoint',                      // 
  MIDI_CHANNEL_PREFIX = 'midiChannelPrefix',
  END_OF_TRACK = 'endOfTrack',                 // 音轨结束标志
  SET_TEMPO = 'setTempo',                      // 速度
  SMPTE_OFFSET = 'smpteOffset',
  TIME_SIGNATURE = 'timeSignature',
  KEY_SIGNATURE = 'keySignature',
  SEQUENCER_SPECIFIC = 'sequencerSpecific',    // 音轨结束标志
  UNKNOWN = 'unknown',

  // channel event
  NOTE_OFF = 'noteOff',                        // 松开音符
  NOTE_ON = 'noteOn',                          // 按下音符
  NOTE_AFTER_TOUCH = 'noteAfterTouch',         // 触后音符
  CONTROLLER = 'controller',                   // 控制器
  PROGRAM_CHANGE = 'programChange',            // 改变乐器
  CHANNEL_AFTER_TOUCH = 'channelAfterTouch',   // 触后通道
  PITCH_BEND = 'pitchBend',                    // 滑音
}

export type SystemEvent = DataParamEvent;

export type MetaEvent =
    NumberParamEvent &
    TextParamEvent & 
    ChannelParamEvent &
    SpeedEvent &
    DataParamEvent &
    SMPTEOffset &
    TimeSignature &
    KeySignature;

export type ChannelEvent =
    NoteEvent & 
    NoteAfterTouchEvent & 
    ChannelAfterTouchEvent &
    ControllerEvent &
    ProgramChangeEvent &
    PitchBendEvent;

export interface BaseEvent {
  deltaTime:number,
  type:MidiEventType,
  subtype:MidiEventSubtype;
}

export interface DataParamEvent extends BaseEvent {
  data:string;
}
export interface NumberParamEvent extends BaseEvent {
  number:number;
}

export interface TextParamEvent extends BaseEvent {
  text:string;
}

export interface ChannelParamEvent extends BaseEvent {
  channel:number;
}

export interface SpeedEvent extends BaseEvent {
  microsecondsPerBeat:number;
}

export interface SMPTEOffset extends BaseEvent {
  frameRate:number;
  hour:number;
  min:number;
  sec:number;
  frame:number;
  subFrame:number;
}

export interface TimeSignature extends BaseEvent {
  numerator:number;
  denominator:number;
  metronome:number;
  thirtySeconds:number;
}

export interface KeySignature extends BaseEvent {
  key:number;
  scale:number;
}

export interface NoteEvent extends BaseEvent {
  noteNumber:number;
  velocity:number;
}

export interface NoteAfterTouchEvent extends BaseEvent {
  noteNumber:number;
  amount:number;
}

export interface ChannelAfterTouchEvent extends BaseEvent {
  amount:number;
}

export interface ControllerEvent extends BaseEvent {
  controllerType:number;
  value:number;
}

export interface ProgramChangeEvent extends BaseEvent {
  programNumber:number;
}

export interface PitchBendEvent extends BaseEvent {
  value:number;
}


