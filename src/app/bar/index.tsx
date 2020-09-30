import * as React from 'react';

import './style.css';

interface IBarProps {
  name:string;
  total:number;
  value:number;
}

export function Bar(props:IBarProps) {
  return (
    <div className='bar-wrapper'>
      <span className='bar-label'>{props.name}</span>
      <div className='bar-outer'>
        <div className='bar-inner' style={{ width: `${props.value / props.total * 100}%`}}>
          <div className='bar-value'>{props.value}</div>
        </div>
      </div>
      <div className='bar-total'>{props.total}</div>
    </div>
  );
}
