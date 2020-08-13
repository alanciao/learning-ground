import { Configuration } from './interfaces';
import { Loader } from './loader';

export class Player {
  private _loader:Loader;

  // control
  private _timeWarp:number = 1;

  constructor(config?:Configuration) {
    this._loader = new Loader();
  }

  public loadBase64File() {}

  public setSpeed(val?:number) {
    val = val || 1;
    if (val < 0) { val = 1; }
    this._timeWarp = 1 / val;
  }

  public setProgram(program:number) {}

  public start() {}

  public stop() {}

  public pause() {}

  public resume() {}
}
