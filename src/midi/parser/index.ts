import { MidiFile } from './midifile';

export function parseMidi(stream:string) : MidiFile {
  return new MidiFile(stream);
}
