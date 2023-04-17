import { RequestHandler } from "@src/types";

import { Chain, HandlerType } from "./Handler.type";

export class HandlerController {
  private handlers: Map<string, Chain>;

  public constructor() {
    this.handlers = new Map();
  }

  public add = (method: string, ...args: Array<HandlerType>): void => {
    const handler = args[args.length - 1];
    const middlewares = args.slice(0, args.length - 1);
    this.handlers.set(method, { middlewares, handler });
  };

  public handle = async ({ method, payload, meta }: RequestHandler): Promise<unknown> => {
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
