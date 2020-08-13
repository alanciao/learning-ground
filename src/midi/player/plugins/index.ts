import { WebAudio } from './webaudio';
import { WebMidi } from './webmidi';
import { AudioTag } from './audiotag';

export const plugins:{[api:string]:Function} = {
  'webmidi': () => new WebMidi(),
  'webaudio': () => new WebAudio(),
  'audiotag': () => new AudioTag(),
};
