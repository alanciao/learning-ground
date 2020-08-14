import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as Midi from '../midi-player';
import { acoustic_grand_piano } from '../midi/soundfont/acoustic_grand_piano-mp3';

function Playground() {
  const input = React.useRef(null);

  const clickButton = async () => {
    const midiFile = require('../assets/test.midi').default;

    // Midi.soundFont.violin = {};
    Midi.soundFont.acoustic_grand_piano = acoustic_grand_piano;

    const midiPlayer = new Midi.Player({
      targetFormat: 'mp3',
      instruments: [
        'acoustic_grand_piano',
      ],
      local: true,
    });

    midiPlayer.loadBase64File(midiFile, {
      onsuccess: () => {
        console.log('load success');
      },
      onprogress: (progress:number) => {
        console.log('progress: ', progress);
      },
      onerror: (error:Error) => console.log(error),
    });

    (window as any).player = midiPlayer;
  };

  return (
    <div>
      <input ref={input} type="file"></input>
      <button onClick={clickButton}>Click</button>
    </div>
  );
}

export function main() {
  ReactDOM.render(
    <Playground />,
    document.getElementById('root'),
  );
}
