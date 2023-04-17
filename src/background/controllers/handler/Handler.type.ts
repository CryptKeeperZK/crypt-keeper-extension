// TODO: eslint fix any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type HandlerType = (payload: any, meta?: any) => Promise<any> | any;

export type Chain = {
  middlewares: HandlerType[];
  handler: HandlerType;
};
