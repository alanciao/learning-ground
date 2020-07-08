import * as React from 'react';

import { ReactReduxContext } from './Context';
import { Subscription } from '../utils/Subscription';

interface ProviderProps {
  store:any;
  context?:React.Context<any>;
  children?:React.ReactNode;
}

export function Provider({ store, context, children }:ProviderProps) {
  const [contextValue, setContextValue] = React.useState('dark');
  
  React.useEffect(() => {
    setContextValue('light' + store);
  }, [store]);
  // const contextValue = React.useMemo(() => {
  //   const subscription = new Subscription(store);
  //   // subscription.onStateChange = ''
  //   return {
  //     store,
  //     subscription,
  //   };
  // }, [store]);

  const Context = context || ReactReduxContext;

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
