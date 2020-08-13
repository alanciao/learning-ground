import { TrackStates, NextEvent, MidiEventSubtype, MidiTemporal } from '../interfaces';
import { MidiFile } from '../../midi-player/parser/interfaces';

const clone = (obj:any) => {
  if (typeof obj !== 'object' || obj === null) { return obj; }
  const ret:any = (typeof obj.length === 'number') ? [] : {};
  for (const key in obj) {
    ret[key] = clone(obj[key]);
  }
  return ret;
};

export class Replayer {
  private beatsPerMinute:number;
  private bpmOverride:boolean;
  private ticksPerBeat:number;
  private trackStates:TrackStates[] = [];

  private midiEvent:NextEvent | undefined;
  private temporal:MidiTemporal = [];
  
  constructor(private file:MidiFile, private timeWarp:number, bpm?:number) {
    this.beatsPerMinute = bpm || 120;
    this.bpmOverride = !!bpm;
    this.ticksPerBeat = file.header.ticksPerBeat;

    file.tracks.forEach((track, index) => {
      this.trackStates[index] = {
        nextEventIndex: 0,
        ticksToNextEvent: track.length ? track[0].deltaTime : NaN,
      }
    });

    while (this.midiEvent = this.getNextEvent()) {
      this.processNext(this.midiEvent);
    }
  }

  public getData() {
    return clone(this.temporal);
  }

  private getNextEvent() {
    let ticksToNextEvent:number | undefined;
    let nextEventTrack:number | undefined;
    let nextEventIndex:number | undefined;

    this.trackStates.forEach((trackState, index) => {
      if (Number.isNaN(trackState.ticksToNextEvent) || 
          (ticksToNextEvent !== undefined && trackState.ticksToNextEvent >= ticksToNextEvent)
      ) { return; }

      ticksToNextEvent = trackState.ticksToNextEvent;
      nextEventTrack = index;
      nextEventIndex = trackState.nextEventIndex;
    });

    if (nextEventTrack !== undefined && nextEventIndex !== undefined) {
      /* consume event from that track */
      const nextEvent = this.file.tracks[nextEventTrack][nextEventIndex];
      if (this.file.tracks[nextEventTrack][nextEventIndex + 1]) {
        this.trackStates[nextEventTrack].ticksToNextEvent += this.file.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
      } else {
        this.trackStates[nextEventTrack].ticksToNextEvent = NaN;
      }
      this.trackStates[nextEventTrack].nextEventIndex += 1;

      /* advance timings on all tracks by ticksToNextEvent */
      this.trackStates.forEach((trackState) => {
        if (!Number.isNaN(trackState.ticksToNextEvent) && ticksToNextEvent !== undefined) {
          trackState.ticksToNextEvent -= ticksToNextEvent;
        }
      });

      return {
        ticksToEvent: ticksToNextEvent,
        event: nextEvent,
        track: nextEventTrack,
      };
    } else {
      return;
    }
  }

  private processNext(midiEvent:NextEvent) {
    if (!this.bpmOverride
        && midiEvent.event.type === 'meta'
        && midiEvent.event.subtype === MidiEventSubtype.SET_TEMPO
        && midiEvent.event.microsecondsPerBeat) {
      // tempo change events can occur anywhere in the middle and affect events that follow
      this.beatsPerMinute = 60000000 / midiEvent.event.microsecondsPerBeat;
    }

    let beatsToGenerate = 0;
    let secondsToGenerate = 0;
    if (midiEvent.ticksToEvent && midiEvent.ticksToEvent > 0) {
      beatsToGenerate = midiEvent.ticksToEvent / this.ticksPerBeat;
      secondsToGenerate = beatsToGenerate / (this.beatsPerMinute / 60);
    }

    const time = (secondsToGenerate * 1000 * this.timeWarp) || 0;
    this.temporal.push([midiEvent, time]);
  }
}
