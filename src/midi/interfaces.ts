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
