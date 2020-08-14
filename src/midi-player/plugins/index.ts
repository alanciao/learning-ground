import { AudioType, IAudioPlugin } from './interfaces'
import { WebMidiPlugin } from './webmidi';
import { WebAudioPlugin } from './webaudio';
import { AudioTagPlugin } from './audiotag';

export function getPlugin(api:AudioType) : IAudioPlugin | undefined {
  switch(api) {
    case 'webMidi':
      return new WebMidiPlugin();
    case 'webAudio':
      return new WebAudioPlugin();
    case 'audioTag':
      return new AudioTagPlugin();
  }
}
