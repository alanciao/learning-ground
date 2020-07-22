import * as React from 'react';
import * as ReactDOM from 'react-dom';

function Playground() {

  const clickButton = async () => {
    //
  };

  return (
    <div>
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
