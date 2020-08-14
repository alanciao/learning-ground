import { MidiFile, MidiEventSubtype } from '../parser/interfaces';
import { TrackStates, NextEvent } from './interfaces';

export class MidiAnalyser {
  private _file:MidiFile;
  private _beatsPerMinute:number = 120;
  private _ticksPerBeat:number;
  private _trackStates:TrackStates[] = [];
  private _temporal:[NextEvent, number][] = [];

  private _matrix:any = [];
  private _eighthNote:number = 0;

  constructor(file:MidiFile) {
    this._file = file;
    this._ticksPerBeat = file.header.ticksPerBeat;
    file.tracks.forEach((track, index) => {
      this._trackStates[index] = {
        nextEventIndex: 0,
        ticksToNextEvent: track.length ? track[0].deltaTime : NaN,
      };
    });

    this._processEvents();
  }

  private _processEvents() {
    let midiEvent;
    while (midiEvent = this._getNextEvent()) {
      this._processNext(midiEvent);
    }
  }

  private _processNext(event:NextEvent) {
    if (event.event.subtype === MidiEventSubtype.SET_TEMPO) {
      console.log(event);
    }

    let beatsToGenerate = 0;
    let secondsToGenerate = 0;
    if (event.ticksToEvent > 0) {
      beatsToGenerate = event.ticksToEvent / this._ticksPerBeat;
      secondsToGenerate = beatsToGenerate / (this._beatsPerMinute / 60);
    }

    const time = (secondsToGenerate * 1000) || 0;  // unit ms
    this._temporal.push([event, time]);
  }

  private _getNextEvent() : NextEvent | undefined {
    let nextEventTrack;
    let ticksToNextEvent:number | undefined;

    this._trackStates.forEach((trackState, index) => {
      if (Number.isNaN(trackState.ticksToNextEvent)) { return; }
      if (ticksToNextEvent !== undefined && (ticksToNextEvent <= trackState.ticksToNextEvent)) { return; }

      ticksToNextEvent = trackState.ticksToNextEvent;
      nextEventTrack = index;
    });
    
    if (nextEventTrack === undefined) { return; }

    /* consume event from that track */
    const trackState = this._trackStates[nextEventTrack];
    const nextEventIndex = trackState.nextEventIndex;
    const ticks = trackState.ticksToNextEvent;
    const nextEvent = this._file.tracks[nextEventTrack][nextEventIndex];
    const succeedingEvent = this._file.tracks[nextEventTrack][nextEventIndex + 1];
    if (succeedingEvent) {
      trackState.ticksToNextEvent += succeedingEvent.deltaTime; 
    } else {
      trackState.ticksToNextEvent = NaN;
    }
    trackState.nextEventIndex++;
    this._trackStates.forEach((trackState) => {
      if (Number.isNaN(trackState.ticksToNextEvent)) { return; }
      trackState.ticksToNextEvent -= ticks;
    });

    return {
      event: nextEvent,
      ticksToEvent: ticks,
      track: nextEventTrack,
    };
  }
}
