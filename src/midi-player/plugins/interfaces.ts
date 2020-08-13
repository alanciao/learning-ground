export interface IAudioPlugin {
  connect(onsuccess?:Function) : void;
  setVolume(volume:number, delay?:number) : void;
  noteOn(channelId:number, noteId:number, velocity:number, delay?:number) : void;
  noteOff(channelId:number, noteId:number, delay?:number) : void;
  changeProgram(channelId:number, program:number, delay?:number) : void;
  pitchBend(channelId:number, program:number, delay?:number) : void;
}
