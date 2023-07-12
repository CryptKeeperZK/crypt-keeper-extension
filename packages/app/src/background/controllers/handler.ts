import { RequestHandler } from "@src/types";

// TODO: eslint fix any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandlerType = (payload: any, meta?: any) => any;

interface Chain {
  middlewares: HandlerType[];
  handler: HandlerType;
}

export default class Handler {
  private handlers: Map<string, Chain>;

  constructor() {
    this.handlers = new Map();
  }

  add = (method: string, ...args: HandlerType[]): void => {
    const handler = args[args.length - 1];
    const middlewares = args.slice(0, args.length - 1);
    this.handlers.set(method, { middlewares, handler });
  };

  handle = async ({ method, payload, meta }: RequestHandler): Promise<unknown> => {
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
