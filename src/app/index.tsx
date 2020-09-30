import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Bar } from './bar';

import './style.css';

interface BarItem {
  name:string;
  total:number;
  value:number;
}

const items:BarItem[] = [
  { name: 'Bread', total: 400, value: 50 },
  { name: 'Yogurt', total: 400, value: 50 },
  { name: 'Chicken', total: 1280, value: 120 },
  { name: 'Beef', total: 320, value: 80 }
];
const TITLES = ['Basic', 'Upgrade', 'Luxury', 'Supreme'];

function Playground() {
  const [values, setValues] = React.useState([50, 50, 120, 80]);
  const [title, setTitle] = React.useState('Basic');
  React.useEffect(
    () => {
      update_title(values);
    },
    [values]
  );

  const update_title = (values:number[]) {
    let level = 0;
    // for (let i = 0; i < 4; i++) {
    //   if ()
    // }
  }

  return (
    <div className='container'>
      <div className='title'>{title}</div>
      {items.map((item) => {
        return (
          <Bar
              key={item.name}
              name={item.name}
              total={item.total}
              value={item.value} />
        );
      })}
    </div>
  );
}

export function main() {
  ReactDOM.render(
    <Playground />,
    document.getElementById('root'),
  );
}
