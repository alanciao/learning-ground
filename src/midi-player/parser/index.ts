import * as I from './interfaces';
import { StringStream } from './stream';

export class MidiFileParser {
  private _lastEventTypeByte:number = 0;

  public parse(fileString:I.BinaryString) {
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
    if (header.ticksPerBeat & 0x8000) {
      throw new Error('Expressing time division in SMTPE frames is not supported yet');
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
    const event = {} as I.MidiEvent;
    event.deltaTime = stream.readVarInt();

    let eventTypeByte:number = stream.readInt8();
    if ((eventTypeByte & 0xf0) === 0xf0) {
      if (eventTypeByte === 0xff) {
        /* meta event */
        event.type = 'meta';
        const subtypeByte = stream.readInt8();
        const length = stream.readVarInt();
        switch (subtypeByte) {
          case 0x00:
            event.subtype = I.MidiEventSubtype.SEQUENCE_NUMBER;
            if (length !== 2) {
              throw new Error('Expected length for sequenceNumber event is 2, got ' + length);
            }
            event.number = stream.readInt16();
            break;
          case 0x01:
            event.subtype = I.MidiEventSubtype.TEXT;
            event.text = stream.read(length);
            break;
          case 0x02:
            event.subtype = I.MidiEventSubtype.COPYRIGHT_NOTICE;
            event.text = stream.read(length);
            break;
          case 0x03:
            event.subtype = I.MidiEventSubtype.TRACK_NAME;
            event.text = stream.read(length);
            break;
          case 0x04:
            event.subtype = I.MidiEventSubtype.INSTRUMENT_NAME;
            event.text = stream.read(length);
            break;
          case 0x05:
            event.subtype = I.MidiEventSubtype.LYRICS;
            event.text = stream.read(length);
            break;
          case 0x06:
            event.subtype = I.MidiEventSubtype.MARKER;
            event.text = stream.read(length);
            break;
          case 0x07:
            event.subtype = I.MidiEventSubtype.CUE_POINT;
            event.text = stream.read(length);
            break;
          case 0x20:
            event.subtype = I.MidiEventSubtype.MIDI_CHANNEL_PREFIX;
            if (length !== 1) {
              throw new Error('Expected length for midiChannelPrefix event is 1, got ' + length);
            }
            event.channel = stream.readInt8();
            break;
          case 0x2f:
            event.subtype = I.MidiEventSubtype.END_OF_TRACK;
            if (length !== 0) {
              throw new Error('Expected length for endOfTrack event is 0, got ' + length);
            }
            break;
          case 0x51:
            event.subtype = I.MidiEventSubtype.SET_TEMPO;
            if (length !== 3) {
              throw new Error('Expected length for setTempo event is 3, got ' + length);
            }
            event.microsecondsPerBeat = (stream.readInt8() << 16) + (stream.readInt8() << 8) + stream.readInt8();
            break;
          case 0x54:
            event.subtype = I.MidiEventSubtype.SMPTE_OFFSET;
            if (length !== 5) {
              throw new Error('Expected length for smpteOffset event is 5, got ' + length);
            }
            const hourByte = stream.readInt8();
            const frameRateObject:{[index:number]:number} = { 0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30 };
            event.frameRate = frameRateObject[hourByte & 0x60];
            event.hour = hourByte & 0x1f;
            event.min = stream.readInt8();
            event.sec = stream.readInt8();
            event.frame = stream.readInt8();
            event.subFrame = stream.readInt8();
            break;
          case 0x58:
            event.subtype = I.MidiEventSubtype.TIME_SIGNATURE;
            if (length !== 4) {
              throw new Error('Expected length for timeSignature event is 4, got ' + length);
            }
            event.numerator = stream.readInt8();
            event.denominator = Math.pow(2, stream.readInt8());
            event.metronome = stream.readInt8();
            event.thirtySeconds = stream.readInt8();
            break;
          case 0x59:
            event.subtype = I.MidiEventSubtype.KEY_SIGNATURE;
            if (length !== 2) {
              throw new Error('Expected length for keySignature event is 2, got ' + length);
            }
            event.key = stream.readInt8(true);
            event.scale = stream.readInt8();
            break;
          case 0x7f:
            event.subtype = I.MidiEventSubtype.SEQUENCER_SPECIFIC;
            event.data = stream.read(length);
            break;
          default:
            event.subtype = I.MidiEventSubtype.UNKNOWN;
            event.data = stream.read(length);
            break;
        }
      } else if (eventTypeByte === 0xf0) {
        event.type = 'sysEx';
        const length = stream.readVarInt();
        event.data = stream.read(length);
      } else if (eventTypeByte === 0xf7) {
        event.type = 'dividedSysEx';
        const length = stream.readVarInt();
        event.data = stream.read(length);
      } else {
        throw new Error('Unrecognised MIDI event type byte: ' + eventTypeByte);
      }
    } else {
      /* channel event */
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
      const eventType = eventTypeByte >> 4;
      event.channel = eventTypeByte & 0x0f;
      event.type = 'channel';
      switch (eventType) {
        case 0x08:
          event.subtype = I.MidiEventSubtype.NOTE_OFF;
          event.noteNumber = param1;
          event.velocity = stream.readInt8();
          break;
        case 0x09:
          event.noteNumber = param1;
          event.velocity = stream.readInt8();
          if (event.velocity === 0) {
            event.subtype = I.MidiEventSubtype.NOTE_OFF;
          } else {
            event.subtype = I.MidiEventSubtype.NOTE_ON;
          }
          break;
        case 0x0a:
          event.subtype = I.MidiEventSubtype.NOTE_AFTER_TOUCH;
          event.noteNumber = param1;
          event.amount = stream.readInt8();
          break;
        case 0x0b:
          event.subtype = I.MidiEventSubtype.CONTROLLER;
          event.controllerType = param1;
          event.value = stream.readInt8();
          break;
        case 0x0c:
          event.subtype = I.MidiEventSubtype.PROGRAM_CHANGE;
          event.programNumber = param1;
          break;
        case 0x0d:
          event.subtype = I.MidiEventSubtype.CHANNEL_AFTER_TOUCH;
          event.amount = param1;
          break;
        case 0x0e:
          event.subtype = I.MidiEventSubtype.PITCH_BEND;
          event.value = (stream.readInt8() << 7) + param1;
          break;
        default:
          throw new Error('Unrecognised MIDI event type: ' + eventType);
      }
    }

    return event;
  }
}
