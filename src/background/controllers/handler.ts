import { HandlerRequest } from "@src/types";

// TODO: eslint fix any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerType = (payload: any, meta?: any) => Promise<any> | any;

type Chain = {
  middlewares: HandlerType[];
  handler: HandlerType;
};

export default class Handler {
  private handlers: Map<string, Chain>;

  public constructor() {
    this.handlers = new Map();
  }

  public add = (method: string, ...args: Array<HandlerType>): void => {
    const handler = args[args.length - 1];
    const middlewares = args.slice(0, args.length - 1);
    this.handlers.set(method, { middlewares, handler });
  };

  public handle = async ({ method, payload, meta }: HandlerRequest): Promise<unknown> => {
    const handler = this.handlers.get(method);

    if (!handler) {
      throw new Error(`method: ${method} is not detected`);
    }

    let enhancedPayload = payload;
    // eslint-disable-next-line no-restricted-syntax
    for (const middleware of handler.middlewares) {
      // eslint-disable-next-line no-await-in-loop
      enhancedPayload = await middleware(enhancedPayload, meta);
    }

    return handler.handler(enhancedPayload, meta) as unknown;
  };
}
