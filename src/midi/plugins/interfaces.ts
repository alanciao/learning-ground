export interface IAudioPlugin {
  connect() : Promise<void>;
  noteOn(channelId:number, noteId:number, velocity:number, delay?:number) : void;
  noteOff(channelId:number, noteId:number, delay?:number) : void;
  changeProgram(channelId:number, program:number, delay?:number) : void;
  pitchBend(channelId:number, program:number, delay?:number) : void;
  setVolume(volume:number, delay?:number) : void;
}

export type AudioType = 'webMidi' | 'webAudio' | 'audioTag';
