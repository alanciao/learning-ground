import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { iMIDI } from '../midi';

const MIDI = (window as any).MIDI;

function Playground() {
  const input = React.useRef(null);

  const clickButton = async () => {
    const midiFile = require('../assets/test.midi').default;
    // console.log(atob(midiFile.split(',')[1]));
    // MIDI.USE_XHR = false;
    // MIDI.Player.loadFile(midiFile, () => {
    //   // MIDI.Player.start();
    // });

    // const player = new iMIDI.Player({
    //   api: 'webaudio',
    //   instruments: [
    //     'acoustic_grand_piano',
    //     'acoustic_guitar_steel',
    //     'violin',
    //   ],
    //   local: true,
    // });
    // player.loadBase64File(midiFile, () => {
    //   // player.start();
    // }, (error:Error) => console.log(error));

    // (window as any).player = player;
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
