import { IAudioPlugin } from './interfaces';

export class AudioTagPlugin implements IAudioPlugin {
  public connect(onsuccess?:Function) {}

  public setVolume(volume:number, delay:number = 0) {}

  public noteOn() {}

  public noteOff() {}

  public changeProgram() {}

  public pitchBend() {}
}
