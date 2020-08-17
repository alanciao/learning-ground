import { Channel, GMInstrument } from './interfaces';

const startKey = 0x15;  // A0
const endKey = 0x6C;    // C8
const keys = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const GM_INSTRUMENTS:GMInstrument[] = [
  { id: 1, name: 'acoustic_grand_piano', category: 'Piano' },
  { id: 2, name: 'bright_acoustic_piano', category: 'Piano' },
  { id: 3, name: 'electric_grand_piano', category: 'Piano' },
  { id: 4, name: 'honky_tonk_piano', category: 'Piano' },
  { id: 5, name: 'electric_piano_1', category: 'Piano' },
  { id: 6, name: 'electric_piano_2', category: 'Piano' },
  { id: 7, name: 'harpsichord', category: 'Piano' },
  { id: 8, name: 'clavinet', category: 'Piano' },

  { id: 9, name: 'celesta', category: 'Chromatic Percussion' },
  { id: 10, name: 'glockenspiel', category: 'Chromatic Percussion' },
  { id: 11, name: 'music_box', category: 'Chromatic Percussion' },
  { id: 12, name: 'vibraphone', category: 'Chromatic Percussion' },
  { id: 13, name: 'marimba', category: 'Chromatic Percussion' },
  { id: 14, name: 'xylophone', category: 'Chromatic Percussion' },
  { id: 15, name: 'tubular_bells', category: 'Chromatic Percussion' },
  { id: 16, name: 'dulcimer', category: 'Chromatic Percussion' },

  { id: 17, name: 'drawbar_organ', category: 'Organ' },
  { id: 18, name: 'percussive_organ', category: 'Organ' },
  { id: 19, name: 'rock_organ', category: 'Organ' },
  { id: 20, name: 'church_organ', category: 'Organ' },
  { id: 21, name: 'reed_organ', category: 'Organ' },
  { id: 22, name: 'accordion_french', category: 'Organ' },
  { id: 23, name: 'harmonica', category: 'Organ' },
  { id: 24, name: 'tango_accordion', category: 'Organ' },

  { id: 25, name: 'acoustic_guitar_nylon', category: 'Guitar' },
  { id: 26, name: 'acoustic_guitar_steel', category: 'Guitar' },
  { id: 27, name: 'electric_guitar_jazz', category: 'Guitar' },
  { id: 28, name: 'electric_guitar_clean', category: 'Guitar' },
  { id: 29, name: 'electric_guitar_muted', category: 'Guitar' },
  { id: 30, name: 'overdriven_guitar', category: 'Guitar' },
  { id: 31, name: 'distortion_guitar', category: 'Guitar' },
  { id: 32, name: 'guitar_harmonics', category: 'Guitar' },

  { id: 33, name: 'acoustic_bass', category: 'Bass' },
  { id: 34, name: 'electric_bass_finger', category: 'Bass' },
  { id: 35, name: 'electric_bass_picked', category: 'Bass' },
  { id: 36, name: 'fretless_bass', category: 'Bass' },
  { id: 37, name: 'slap_bass_1', category: 'Bass' },
  { id: 38, name: 'slap_bass_2', category: 'Bass' },
  { id: 39, name: 'synth_bass_1', category: 'Bass' },
  { id: 40, name: 'synth_bass_2', category: 'Bass' },

  { id: 41, name: 'violin', category: 'Strings' },
  { id: 42, name: 'viola', category: 'Strings' },
  { id: 43, name: 'cello', category: 'Strings' },
  { id: 44, name: 'contrabass', category: 'Strings' },
  { id: 45, name: 'tremolo_strings', category: 'Strings' },
  { id: 46, name: 'pizzicato_strings', category: 'Strings' },
  { id: 47, name: 'orchestral_harp', category: 'Strings' },
  { id: 48, name: 'timpani', category: 'Strings' },

  { id: 49, name: 'string_ensemble_1', category: 'Ensemble' },
  { id: 50, name: 'string_ensemble_2', category: 'Ensemble' },
  { id: 51, name: 'synth_strings_1', category: 'Ensemble' },
  { id: 52, name: 'synth_strings_2', category: 'Ensemble' },
  { id: 53, name: 'choir_aahs', category: 'Ensemble' },
  { id: 54, name: 'voice_oohs', category: 'Ensemble' },
  { id: 55, name: 'synth_choir', category: 'Ensemble' },
  { id: 56, name: 'orchestra_hit', category: 'Ensemble' },

  { id: 57, name: 'trumpet', category: 'Brass' },
  { id: 58, name: 'trombone', category: 'Brass' },
  { id: 59, name: 'tuba', category: 'Brass' },
  { id: 60, name: 'muted_trumpet', category: 'Brass' },
  { id: 61, name: 'french_horn', category: 'Brass' },
  { id: 62, name: 'brass_section', category: 'Brass' },
  { id: 63, name: 'synth_brass_1', category: 'Brass' },
  { id: 64, name: 'synth_brass_2', category: 'Brass' },

  { id: 65, name: 'soprano_sax', category: 'Reed' },
  { id: 66, name: 'alto_sax', category: 'Reed' },
  { id: 67, name: 'tenor_sax', category: 'Reed' },
  { id: 68, name: 'baritone_sax', category: 'Reed' },
  { id: 69, name: 'oboe', category: 'Reed' },
  { id: 70, name: 'english_horn', category: 'Reed' },
  { id: 71, name: 'bassoon', category: 'Reed' },
  { id: 72, name: 'clarinet', category: 'Reed' },

  { id: 73, name: 'piccolo', category: 'Pipe' },
  { id: 74, name: 'flute', category: 'Pipe' },
  { id: 75, name: 'recorder', category: 'Pipe' },
  { id: 76, name: 'pan_flute', category: 'Pipe' },
  { id: 77, name: 'blown_bottle', category: 'Pipe' },
  { id: 78, name: 'shakuhachi', category: 'Pipe' },
  { id: 79, name: 'whistle', category: 'Pipe' },
  { id: 80, name: 'ocarina', category: 'Pipe' },

  { id: 81, name: 'lead_1_square', category: 'Synth Lead' },
  { id: 82, name: 'lead_2_sawtooth', category: 'Synth Lead' },
  { id: 83, name: 'lead_3_calliope', category: 'Synth Lead' },
  { id: 84, name: 'lead_4_chiff', category: 'Synth Lead' },
  { id: 85, name: 'lead_5_charang', category: 'Synth Lead' },
  { id: 86, name: 'lead_6_voice', category: 'Synth Lead' },
  { id: 87, name: 'lead_7_fifths', category: 'Synth Lead' },
  { id: 88, name: 'lead_8_base_lead', category: 'Synth Lead' },

  { id: 89, name: 'pad_1_new_age', category: 'Synth Pad' },
  { id: 90, name: 'pad_2_warm', category: 'Synth Pad' },
  { id: 91, name: 'pad_3_polysynth', category: 'Synth Pad' },
  { id: 92, name: 'pad_4_choir', category: 'Synth Pad' },
  { id: 93, name: 'pad_5_bowed', category: 'Synth Pad' },
  { id: 94, name: 'pad_6_metallic', category: 'Synth Pad' },
  { id: 95, name: 'pad_7_halo', category: 'Synth Pad' },
  { id: 96, name: 'pad_8_sweep', category: 'Synth Pad' },

  { id: 97, name: 'fx_1_rain', category: 'Synth Effects' },
  { id: 98, name: 'fx_2_soundtrack', category: 'Synth Effects' },
  { id: 99, name: 'fx_3_crystal', category: 'Synth Effects' },
  { id: 100, name: 'fx_4_atmosphere', category: 'Synth Effects' },
  { id: 101, name: 'fx_5_brightness', category: 'Synth Effects' },
  { id: 102, name: 'fx_6_goblins', category: 'Synth Effects' },
  { id: 103, name: 'fx_7_echoes', category: 'Synth Effects' },
  { id: 104, name: 'fx_8_sci_fi', category: 'Synth Effects' },

  { id: 105, name: 'sitar', category: 'Ethnic' },
  { id: 106, name: 'banjo', category: 'Ethnic' },
  { id: 107, name: 'shamisen', category: 'Ethnic' },
  { id: 108, name: 'koto', category: 'Ethnic' },
  { id: 109, name: 'kalimba', category: 'Ethnic' },
  { id: 110, name: 'bagpipe', category: 'Ethnic' },
  { id: 111, name: 'fiddle', category: 'Ethnic' },
  { id: 112, name: 'shanai', category: 'Ethnic' },

  { id: 113, name: 'tinkle_bell', category: 'Percussive' },
  { id: 114, name: 'agogo', category: 'Percussive' },
  { id: 115, name: 'steel_drums', category: 'Percussive' },
  { id: 116, name: 'woodblock', category: 'Percussive' },
  { id: 117, name: 'taiko_drum', category: 'Percussive' },
  { id: 118, name: 'melodic_tom', category: 'Percussive' },
  { id: 119, name: 'synth_drum', category: 'Percussive' },
  { id: 120, name: 'reverse_cymbal', category: 'Percussive' },

  { id: 121, name: 'guitar_fret_noise', category: 'Sound Effects' },
  { id: 122, name: 'breath_noise', category: 'Sound Effects' },
  { id: 123, name: 'seashore', category: 'Sound Effects' },
  { id: 124, name: 'bird_tweet', category: 'Sound Effects' },
  { id: 125, name: 'telephone_ring', category: 'Sound Effects' },
  { id: 126, name: 'helicopter', category: 'Sound Effects' },
  { id: 127, name: 'applause', category: 'Sound Effects' },
  { id: 128, name: 'gunshot', category: 'Sound Effects' },
];

class GMClass {
  private readonly _channels:Channel[] = [];
  private readonly _keyToNote:{[key:string]:number} = {};
  private readonly _noteToKey:{[note:number]:string} = {};
  private readonly _instrumentsById:{[id:number]:GMInstrument} = {};
  private readonly _instrumentsByName:{[name:string]:GMInstrument} = {};

  constructor() {
    this._createChannels();
    this._createNoteConversions();
    this._createInstruments();
  }

  public getChannel(channelId:number) {
    return this._channels[channelId];
  }

  public getKeyToNote() {
    return this._keyToNote;
  }

  public getNoteToKey() {
    return this._noteToKey;
  }

  public getInstrumentById(id:number) {
    return this._instrumentsById[id];
  }

  public getInstrumentByName(name:string) {
    return this._instrumentsByName[name];
  }

  public getChannelInstrument(channelId:number) {
    const channel = this._channels[channelId];
    return channel && channel.instrument;
  }

  public setChannelInstrument(channelId:number, program:number) {
    const channel = this._channels[channelId];
    if (!channel) { return; }
    channel.instrument = program;
  }

  public isChannelMuted(channelId:number) {
    const channel = this._channels[channelId];
    return channel && channel.mute;
  }

  public muteChannel(channelId:number, mute?:boolean) {
    const channel = this._channels[channelId];
    if (!channel) { return; }
    channel.mute = mute || true;
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
      const octave = Math.floor((n - 12) / 12);
      const key = keys[n % 12];
      const name = key + octave;
      this._keyToNote[name] = n;
      this._noteToKey[n] = name;
    }
  }

  /**
   * Instruments
   */
  private _createInstruments() {
    GM_INSTRUMENTS.forEach((instrument) => {
      this._instrumentsById[instrument.id] = instrument;
      this._instrumentsByName[instrument.name] = instrument;
    });
  }
}

export const GM = new GMClass();
