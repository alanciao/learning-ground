import * as I from './interfaces';
import { StringStream } from './stream';

const FRAME_RATE_MAP:{[index:number]:number} = { 0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30 };

export class MidiFileParser {
  private _lastEventTypeByte:number = 0;

  public parse(fileString:I.BinaryString) : I.MidiFile {
    const stream = new StringStream(fileString);
    const headerChunk = this._readChunk(stream);
    if (headerChunk.id !== 'MThd' || headerChunk.length !== 6) {
      throw new Error('Bad midi file - header not found!');
    }

    const headerData = new StringStream(headerChunk.data);
    const header:I.MidiHeader = {
      formatType: headerData.readInt16(),
      trackCount: headerData.readInt16(),
      ticksPerBeat: headerData.readInt16(),
    };

    const division = header.ticksPerBeat;
    if (division & 0x8000) {
      /* SMPTE */
      header.ticksPerBeat = division & 0xFF;
      header.frame = 128 - ((division & 0x7F00) >> 8);
    }
    

    const tracks:I.MidiTrack[] = [];
    for (let i = 0; i < header.trackCount; i++) {
      tracks[i] = [];
      const trackChunk = this._readChunk(stream);
      if (trackChunk.id !== 'MTrk') {
        throw new Error('Unexpected chunk - expected MTrk, got ' + trackChunk.id);
      }
      const trackData = new StringStream(trackChunk.data);
      while (!trackData.eof()) {
        tracks[i].push(this._readEvent(trackData));
      }
    }

    return { header, tracks };
  }

  private _readChunk(stream:StringStream) {
    const id = stream.read(4);
    const length = stream.readInt32();

    return {
      id,
      length,
      data: stream.read(length),
    };
  }

  private _readEvent(stream:StringStream) {
    const deltaTime = stream.readVarInt();

    let eventTypeByte:number = stream.readInt8();
    if (eventTypeByte === 0xff) {
      /* meta event */
      const event = {} as I.MidiMetaEvent;
      event.type = 'meta';
      event.deltaTime = deltaTime;

      const subtypeByte = stream.readInt8();
      const length = stream.readVarInt();
      switch (subtypeByte) {
        case 0x00:
          event.subtype = I.MidiMetaEventType.SEQUENCE_NUMBER;
          if (length !== 2) {
            throw new Error('Expected length for sequenceNumber event is 2, got ' + length);
          }
          event.value = stream.readInt16();
          break;

        case 0x01:
          event.subtype = I.MidiMetaEventType.TEXT;
          event.text = stream.read(length);
          break;
        case 0x02:
          event.subtype = I.MidiMetaEventType.COPYRIGHT_NOTICE;
          event.text = stream.read(length);
          break;
        case 0x03:
          event.subtype = I.MidiMetaEventType.TRACK_NAME;
          event.text = stream.read(length);
          break;
        case 0x04:
          event.subtype = I.MidiMetaEventType.INSTRUMENT_NAME;
          event.text = stream.read(length);
          break;
        case 0x05:
          event.subtype = I.MidiMetaEventType.LYRICS;
          event.text = stream.read(length);
          break;
        case 0x06:
          event.subtype = I.MidiMetaEventType.MARKER;
          event.text = stream.read(length);
          break;
        case 0x07:
          event.subtype = I.MidiMetaEventType.CUE_POINT;
          event.text = stream.read(length);
          break;

        case 0x20:
          event.subtype = I.MidiMetaEventType.MIDI_CHANNEL_PREFIX;
          if (length !== 1) {
            throw new Error('Expected length for midiChannelPrefix event is 1, got ' + length);
          }
          event.value = stream.readInt8();
          break;
        case 0x21:
          event.subtype = I.MidiMetaEventType.MIDI_PORT_PREFIX;
          if (length !== 1) {
            throw new Error('Expected length for midiPortPrefix event is 1, got ' + length);
          }
          event.value = stream.readInt8();
          break;
        case 0x2f:
          event.subtype = I.MidiMetaEventType.END_OF_TRACK;
          if (length !== 0) {
            throw new Error('Expected length for endOfTrack event is 0, got ' + length);
          }
          break;

        case 0x51:
          event.subtype = I.MidiMetaEventType.SET_TEMPO;
          if (length !== 3) {
            throw new Error('Expected length for setTempo event is 3, got ' + length);
          }
          event.value = stream.readInt24(); // microseconds per quarter
          break;
        case 0x54:
          event.subtype = I.MidiMetaEventType.SMPTE_OFFSET;
          if (length !== 5) {
            throw new Error('Expected length for smpteOffset event is 5, got ' + length);
          }
          const hourByte = stream.readInt8();
          event.params = {
            frameRate: FRAME_RATE_MAP[hourByte & 0x60],
            hours: hourByte & 0x1f,
            minutes: stream.readInt8(),
            seconds: stream.readInt8(),
            frame: stream.readInt8(),
            subFrame: stream.readInt8(),
          };
          break;
        case 0x58:
          event.subtype = I.MidiMetaEventType.TIME_SIGNATURE;
          if (length !== 4) {
            throw new Error('Expected length for timeSignature event is 4, got ' + length);
          }
          event.params = {
            numerator: stream.readInt8(),
            denominator: Math.pow(2, stream.readInt8()),
            metronome: stream.readInt8(),
            thirtySeconds: stream.readInt8(),
          };
          break;
        case 0x59:
          event.subtype = I.MidiMetaEventType.KEY_SIGNATURE;
          if (length !== 2) {
            throw new Error('Expected length for keySignature event is 2, got ' + length);
          }
          event.params = {
            key: stream.readInt8(true),
            scale: stream.readInt8(),
          };
          break;

        case 0x7f:
          event.subtype = I.MidiMetaEventType.SEQUENCER_SPECIFIC;
          event.data = stream.read(length);
          break;
        default:
          event.subtype = I.MidiMetaEventType.UNKNOWN;
          event.value = subtypeByte;
          event.data = stream.read(length);
          break;
      }
      return event;
    } else if ((eventTypeByte & 0xf0) === 0xf0) {
      /* sysEx event */
      const event = {} as I.MidiSysExEvent;
      if (eventTypeByte === 0xf0) {
        event.type = 'sysEx';
      } else if (eventTypeByte === 0xf7) {
        event.type = 'sysEsc';
      } else {
        throw new Error('Unrecognised MIDI sysex event type byte: ' + eventTypeByte);
      }
      event.deltaTime = deltaTime;
      event.length = stream.readVarInt();
      event.data = stream.read(event.length);
      return event;
    } else {
      /* channel event */
      const event = {} as I.MidiChannelEvent;
      let param1;
      if ((eventTypeByte & 0x80) === 0) {
        // running status - reuse lastEventTypeByte as the event type.
				// eventTypeByte is actually the first parameter
        param1 = eventTypeByte;
        eventTypeByte = this._lastEventTypeByte;
      } else {
        param1 = stream.readInt8();
        this._lastEventTypeByte = eventTypeByte;
      }

      event.type = 'channel';
      event.deltaTime = deltaTime;
      event.channel = eventTypeByte & 0x0f;
      const eventType = eventTypeByte >> 4;
      switch (eventType) {
        case 0x08:
          event.subtype = I.MidiChannelEventType.NOTE_OFF;
          event.noteNumber = param1;
          event.velocity = stream.readInt8();
          break;
        case 0x09:
          event.noteNumber = param1;
          event.velocity = stream.readInt8();
          if (event.velocity === 0) {
            event.subtype = I.MidiChannelEventType.NOTE_OFF;
          } else {
            event.subtype = I.MidiChannelEventType.NOTE_ON;
          }
          break;
        case 0x0a:
          event.subtype = I.MidiChannelEventType.NOTE_AFTER_TOUCH;
          event.noteNumber = param1;
          event.velocity = stream.readInt8();
          break;
        case 0x0b:
          event.subtype = I.MidiChannelEventType.CONTROLLER;
          event.controller = param1;
          event.value = stream.readInt8();
          break;
        case 0x0c:
          event.subtype = I.MidiChannelEventType.PROGRAM_CHANGE;
          event.value = param1;
          break;
        case 0x0d:
          event.subtype = I.MidiChannelEventType.CHANNEL_AFTER_TOUCH;
          event.value = param1;
          break;
        case 0x0e:
          event.subtype = I.MidiChannelEventType.PITCH_BEND;
          event.value = (stream.readInt8() << 7) + param1;
          break;
        default:
          throw new Error('Unrecognised MIDI event type: ' + eventType);
      }

      return event;
    }
  }
}
