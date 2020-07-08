import { main } from './app';
import * as Redux from '../libs/redux/src';
import { NativeBridge } from './bridge';

(window as any).Redux = Redux;

(window as any).bridge = new NativeBridge((action) => console.log(action));

// main();
