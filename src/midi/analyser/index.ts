import { MidiFile, MidiMetaEventType, MidiMetaEvent, MidiChannelEvent, MidiChannelEventType } from '../parser/interfaces';
import { TrackStates, NextEvent, MidiMatrix } from './interfaces';

const MATRIX_TO_NOTE = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71];

export class MidiAnalyser {
  private _bpm:number = 120;
  private _ticksPerBeat:number = 120;

  private _trackStates:TrackStates[] = [];
  private _temporal:NextEvent[] = [];
  
  public getData(start:number, end:number = 0) {
    const data:NextEvent[] = [];
    const startTicks = this._ticksPerBeat * start / 2;
    end = end <= start ? 0 : this._ticksPerBeat * end / 2;
    let ticks = 0;
    this._temporal.forEach((event) => {
      ticks += event.ticksToEvent;
      if (ticks < startTicks) { return; }
      if (end && ticks > end) { return; }
      data.push(event);
    });

    return data;
  }

  public getBPM() {
    return this._bpm;
  }

  public getTickTime() {
    return 60000 / (this._bpm * this._ticksPerBeat);
  }

  /**
   * Analyse midi file
   *
   * @param file
   */
  public analyseMidiFile(file:MidiFile) {
    if (file.header.formatType === 2) {
      throw Error('This type of MIDI is not supported yet.');
    }

    this._ticksPerBeat = file.header.ticksPerBeat;
    file.tracks.forEach((track, index) => {
      this._trackStates[index] = {
        nextEventIndex: 0,
        ticksToNextEvent: track.length ? track[0].deltaTime : NaN,
      };
    });

    // process each event
    let midiEvent;
    while (midiEvent = this._getNextEvent(file)) {
      this._processNext(midiEvent);
    }
    this._trackStates = [];
  }

  private _getNextEvent(file:MidiFile) : NextEvent | undefined {
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
    const nextEvent = file.tracks[nextEventTrack][nextEventIndex];
    const succeedingEvent = file.tracks[nextEventTrack][nextEventIndex + 1];
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

  private _processNext(event:NextEvent) {
    const midiEvent = event.event;
    if ((midiEvent as MidiMetaEvent).subtype === MidiMetaEventType.SET_TEMPO) {
      this._bpm = 60000000 / (midiEvent as MidiMetaEvent).value;
    }

    this._temporal.push(event);
  }

  /**
   * Analyse midi matrix
   *
   * @param matrix
   */
  public analyseMidiMatrix(matrix:MidiMatrix) {
    // TODO set channel program
  
    let ticksToEvent = 0;
    matrix.forEach((column, index) => {
      if (typeof column === 'number') {
        column = [column];
      }
      let noteOff:NextEvent[] = [];
      column.forEach((note, i) => {
        if (typeof note === 'number' && note > 0) {
          if (note > 22) { note = 22 }
          const eventNoteOn = {} as MidiChannelEvent;
          eventNoteOn.channel = 1;
          eventNoteOn.noteNumber = MATRIX_TO_NOTE[note];
          eventNoteOn.type = 'channel';
          eventNoteOn.subtype = MidiChannelEventType.NOTE_ON;
          eventNoteOn.velocity = 100;
          eventNoteOn.deltaTime = i || ticksToEvent;
          this._temporal.push({
            event: eventNoteOn,
            ticksToEvent: eventNoteOn.deltaTime,
            track: 0,
          });

          const eventNoteOff = {} as MidiChannelEvent;
          eventNoteOff.channel = 1;
          eventNoteOff.noteNumber = MATRIX_TO_NOTE[note];
          eventNoteOff.type = 'channel';
          eventNoteOff.subtype = MidiChannelEventType.NOTE_OFF;
          eventNoteOff.deltaTime = i || this._ticksPerBeat / 2;
          noteOff.push({
            event: eventNoteOff,
            ticksToEvent: eventNoteOff.deltaTime,
            track: 0,
          });
        }
      });
      if (noteOff.length > 0) {
        ticksToEvent = 0;
      } else {
        ticksToEvent += this._ticksPerBeat / 2;
      }
      this._temporal.push(...noteOff);
      noteOff = [];
    });
  }
}
