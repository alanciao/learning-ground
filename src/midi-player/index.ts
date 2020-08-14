import { Player } from './core/player';
import { GM } from './core/gm';
import { SoundFont } from './core/interfaces';

const soundFont:SoundFont = {};
(window as any).soundFont = soundFont;

export {
  Player,
  GM,
  soundFont,
};
