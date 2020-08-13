import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { iMIDI } from '../midi';

const MIDI = (window as any).MIDI;

function Playground() {
  const inputRef = React.useRef(null);

  const clickButton = async () => {
    const file = inputRef.current && inputRef.current.files[0];
    const reader = new FileReader();
    reader.onload = (buffer:any) => {
      (window as any).buffer = buffer;
    }
    reader.readAsArrayBuffer(file);

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
    //   player.start();
    // }, (error:Error) => console.log(error));

    // (window as any).player = player;
  };

  return (
    <div>
      <input ref={inputRef} type="file"></input>
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
