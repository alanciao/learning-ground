import { Channels, GMInstruments } from './interfaces';

const startKey = 0x30;  // C3
const endKey = 0x53;    // B5
const keys = ['C', undefined, 'D', undefined, 'E', 'F', undefined, 'G', undefined, 'A', undefined, 'B'];
const instruments:{[key:string]:string[]} = {
  'Piano': ['1 acoustic_grand_piano'],
  'Guitar': ['26 acoustic_guitar_steel'],
  'Strings': ['41 violin'],
};

class GMClass {
  private readonly _channels:Channels = {};
  private readonly _keyToNote:{[key:string]:number} = {};
  private readonly _noteToKey:{[note:number]:string} = {};
  private readonly _instruments:GMInstruments = {
    byId: {},
    byName: {},
  };

  constructor() {
    this._createInstruments();
    this._createChannels();
    this._createNoteConversions();
  }

  /**
   * Instruments
   */
  private _createInstruments() {
    for (const key in instruments) {
      instruments[key].forEach((instrument) => {
        const [num, name] = instrument.split(' ');
        const id = parseInt(num);
        this._instruments.byId[id] = this._instruments.byName[name] = {
          id,
          name,
          category: key,
        };
      });
    }
  }

  /**
   * Channels
   */
  private _createChannels() {
    for (let i = 0; i < 16; i++) {
      this._channels[i] = {  // default values
        instrument: i,
        pitchBend: 0,
        mute: false,
        mono: false,
        omni: false,
        solo:false,
      };
    }
  }

  /**
   * Note conversions
   */
  private _createNoteConversions() {
    for (let n = startKey; n <= endKey; n++) {
      const octave = (n - 12) / 12 >> 0;
      const key = keys[n % 12];
      if (!key) { continue; }
      const name = key + octave;
      this._keyToNote[name] = n;
      this._noteToKey[n] = name;
    }
  }

  public getInstrument(channelId:number) {
    const channel = this._channels[channelId];
    return channel && channel.instrument;
  }

  public setInstrument(channelId:number, program:number, delay:number = 0) {
    const channel = this._channels[channelId];
    if (!channel) { return; }
    if (delay) {
      setTimeout(() => { channel.instrument = program; }, delay);
    } else {
      channel.instrument = program;
    }
  }
}

export const GM = new GMClass();
