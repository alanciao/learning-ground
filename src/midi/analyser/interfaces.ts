import { MidiEvent } from '../parser/interfaces';

export interface TrackStates {
  nextEventIndex:number;
  ticksToNextEvent:number;
}

export interface NextEvent {
  ticksToEvent:number;
  event:MidiEvent;
  track:number;
}

export type MidiMatrix = (number | number[])[];
