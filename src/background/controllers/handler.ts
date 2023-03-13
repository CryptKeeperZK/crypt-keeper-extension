import { HandlerRequest } from "@src/types";

// TODO: eslint fix any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerType = (payload: any, meta?: any) => Promise<any> | any;

type Chain = {
  middlewares: Array<HandlerType>;
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

  public handle = async (request: HandlerRequest): Promise<unknown> => {
    const { method } = request;
    const handler: Chain | undefined = this.handlers.get(method);
    if (!handler) throw new Error(`method: ${method} not detected`);

    const { meta } = request;
    let { payload } = request;

    // eslint-disable-next-line no-restricted-syntax
    for (const middleware of handler.middlewares) {
      // eslint-disable-next-line no-await-in-loop
      payload = await middleware(payload, meta);
    }

    return handler.handler(payload, meta) as unknown;
  };
}
