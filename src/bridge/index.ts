import * as dsBridge from 'dsbridge';

class NativeBridge {
  private _bridge = dsBridge;
}

export const Bridge = new NativeBridge();
