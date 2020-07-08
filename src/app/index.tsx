import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Provider } from '../libs/react-redux';

function Playground() {
  const value = React.useContext(TestContext);

  return (
    <div>
      <button>Click</button>
      <div>{value}</div>
    </div>
  );
}

const TestContext = React.createContext('light');

export function main() {
  ReactDOM.render(
    <Provider store={{}} context={TestContext}>
      <Playground />
    </Provider>,
    document.getElementById('root'),
  );
}
