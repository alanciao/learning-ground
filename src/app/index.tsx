import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { acoustic_grand_piano } from '../midi/assets/acoustic_grand_piano-mp3';

import { MidiFileParser } from '../midi/parser';
import { GM, soundFont } from '../midi/core';
import { MidiAnalyser } from '../midi/analyser';
import { Player } from '../midi/player';

const midiFile = require('../assets/25537star01.midi').default;

function Playground() {
  const clickButton = async () => {
    // Midi.soundFont.violin = {};
    soundFont.acoustic_grand_piano = acoustic_grand_piano;

    const midiPlayer = new Player({
      targetFormat: 'mp3',
      local: true,
    });

    let total = 0;
    // midiPlayer.loadBase64File(midiFile, {
    //   onsuccess: () => {
    //     const tick = midiPlayer.getTickTime();
    //     midiPlayer.addStartListener(() => {
    //       setInterval(() => {
    //         if (midiPlayer.isPlaying()) {
    //           total++;
    //         } else {
    //         }
    //       }, 60 / (midiPlayer.getBeatPerMinutes() * 2) * 1000);
    //     });
    //     setTimeout(() => midiPlayer.start(14, 29), 2000);
    //   },
    //   onerror: (error:Error) => console.log(error),
    // });

    midiPlayer.loadMatrix([8, 0, 8, 0, 12, 0, 12, 0, 13, 0, 13, 0, 12, 0, 0, 0, 11, 0, 11, 0, 10, 0, 10, 0, 9, 0, 9, 0, 8], {
      onsuccess: () => {
        setTimeout(() => midiPlayer.start(), 2000);
      },
      onerror: (error:Error) => console.error(error),
    });

    (window as any).player = midiPlayer;
  };

  const testParser = () => {
    const parser = new MidiFileParser();
    const file = parser.parse(atob(midiFile.split(',')[1]));
    const analyser = new MidiAnalyser();
    analyser.analyseMidiFile(file);
    (window as any).analyser = analyser;
  };

  return (
    <div>
      <button onClick={clickButton}>Click</button>
      <button onClick={testParser}>Test Parser</button>
    </div>
  );
}

export function main() {
  ReactDOM.render(
    <Playground />,
    document.getElementById('root'),
  );
}
