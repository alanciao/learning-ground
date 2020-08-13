import { Player, GM } from './player';
import { SoundFont } from './soundfont';

export const iMIDI = {
  Player,
  GM,
  SoundFont,
};

(window as any).iMIDI = iMIDI;
