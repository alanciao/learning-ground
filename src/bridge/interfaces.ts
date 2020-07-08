export type Handler = (state:State|undefined, action:Action) => any;
export type Action = { type:string, payload:any, callback?:Function };
export type Listener = () => void;

export interface State {}
