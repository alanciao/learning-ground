import { BinaryString } from './interfaces';

export class StringStream {
  private position:number = 0;

  constructor(private str:BinaryString) {}

  public read(length:number) {
    return this.str.substring(this.position, this.position += length);
  }

  /* read a big-endian 32-bit integer */
  public readInt32() {
    return (this._step() << 24) + (this._step() << 16) + (this._step() << 8) + this._step();
  }

  /* read a big-endian 24-bit integer */
  public readInt24() {
    return (this._step() << 16) + (this._step() << 8) + this._step();
  }

	/* read a big-endian 16-bit integer */
  public readInt16() {
    return (this._step() << 8) + this._step();
  }

  /* read an 8-bit integer */
  public readInt8(signed?:boolean) {
    let result = this._step();
    if (signed && result > 127) {
      result -= 256;
    }
    return result;
  }

  /* read a MIDI-style variable-length integer
		(big-endian value in groups of 7 bits,
		with top bit set to signify that another byte follows)
	*/
  public readVarInt() {
    let result = 0;
    let b = this._step();
    while (b & 0x80) {
      result += (b & 0x7f);
      result <<= 7;
      b = this._step();
    }

    return result + b;
  }

  public eof() {
    return this.position >= this.str.length;
  }

  private _step() {
    return this.str.charCodeAt(this.position++);
  }
}
