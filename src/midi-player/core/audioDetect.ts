import { AudioDetectSupports } from './interfaces';

export async function audioDetect() : Promise<AudioDetectSupports> {
  // detect jazz-midi plugin
  if ((navigator as any).requestMIDIAccess) {
    const isNative = Function.prototype.toString.call((navigator as any).requestMIDIAccess).indexOf('[native code]');
  }

  return new Promise((resolve) => {
    resolve({
      webAudio: true,
      ogg: true,
    });
  });
}