import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { iMIDI } from '../midi';

function Playground() {
  const input = React.useRef(null);

  const clickButton = async () => {
    const midiFile = require('../assets/t.midi').default;

    const player = new iMIDI.Player({
      api: 'webaudio',
      instruments: [
        'acoustic_grand_piano',
        'acoustic_guitar_steel',
        'violin',
      ],
      local: true,
    });
    player.loadBase64File(midiFile, () => {
      player.start();
    }, (error:Error) => console.log(error));

    (window as any).player = player;
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
