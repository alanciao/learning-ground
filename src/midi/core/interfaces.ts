export interface Channel {
  instrument:number;
  pitchBend:number;
  mute:boolean;
  mono:boolean;
  omni:boolean;
  solo:boolean;
}

export interface GMInstruments {
  byId:{[id:number]:GMInstrument};
  byName:{[name:string]:GMInstrument};
}

export interface GMInstrument {
  id:number;
  name:string;
  category:string;
}
