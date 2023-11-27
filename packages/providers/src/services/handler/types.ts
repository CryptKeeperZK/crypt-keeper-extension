import type { EventHandler, EventName } from "../event";
import type { IInjectedMessageData, IInjectedProviderRequest } from "@cryptkeeperzk/types";

export interface RequestsPromisesHandlers {
  resolve: (res?: unknown) => void;
  reject: (reason?: unknown) => void;
}

export interface IHandler {
  request: (message: IInjectedProviderRequest) => Promise<unknown>;
  eventResponser: (event: MessageEvent<IInjectedMessageData>) => unknown;
  on: (eventName: EventName, cb: EventHandler) => void;
  emit: (eventName: EventName, payload?: unknown) => void;
  cleanListeners: () => void;
  getConnectedOrigin: () => string | undefined;
}
