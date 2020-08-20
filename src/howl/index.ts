export class HowlerGlobal {
  constructor() {
    this.init();
  }

  protected init() {
    //
  }

  public volumn() {}

  public mute() {}

  public stop() {}

  public unload() {}

  public codecs() {}

  protected _setup() {}

  protected _setupCodcs() {}

  protected _unlockAudio() {}

  protected _obtainHtml5Audio() {}

  protected _releaseHtml5Audio() {}

  protected _autoSuspend() {}

  protected _autoResume() {}
}

export const Howler = new HowlerGlobal();

export interface Options {
  src: string[];
}

export class Howl {
  constructor(options:Options) {
    this.init(options);
  }

  public init(options:Options) {}

  public load() {}

  public play(sprite:string | number, internal:boolean) {}

  public pause(id:number) {}

  public stop(id:number, internal:boolean) {}

  public mute(muted:boolean, id:number) {}

  public volumn() {}

  public fade(from:number, to:number, len:number, id:number) {}

  protected _startFadeInterval(sound:Sound, from:number, to:number, len:number, id:number, isGroup:boolean) {}
  
  protected _stopFade(id:number) {}

  public loop() {}

  public rate() {}

  public seek() {}

  public playing() {}

  public duration() {}

  public state() {}

  public unload() {}

  public on() {}

  public off() {}

  public once() {}

  protected _emit(event:string, id:number, msg:number) {}

  protected _loadQueue(event:any) {}

  protected _ended(sound:Sound) {}

  protected _clearTimer(id:number) {}

  protected _soundById(id:number) {}

  protected _inactiveSound() {}

  protected _drain() {}

  protected _getSoundIds(id:number) {}

  protected _refreshBuffer(sound:Sound) {}

  protected _cleanBuffer(node:any) {}

  protected _clearSound(node:any) {}
}

export class Sound {
  constructor(protected _parent:Howl) {
    this.init();
  }

  public init() {}

  public create() {}

  public reset() {}

  protected _errorListener() {}

  protected _loadListener() {}
}

export function loadBuffer(self:Howl) {}

export function safeXhrSend(xhr:XMLHttpRequest) {}

export function decodeAudioData(arrayBuffer:ArrayBuffer, self:Howl) {}

export function loadSound() {}

export function setupAudioContext() {}
