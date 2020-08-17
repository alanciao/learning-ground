import { IAudioPlugin } from './interfaces';

export class WebMidiPlugin implements IAudioPlugin {
  public async connect() {}

  public setVolume(volume:number, delay:number = 0) {}

  public noteOn() {}

  public noteOff() {}

  public changeProgram() {}

  public pitchBend() {}
}
