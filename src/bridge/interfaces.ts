export type Handler = (action:Action) => any;
export type Action = { type:string, payload:any };
