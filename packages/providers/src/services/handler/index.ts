import type { RequestsPromisesHandlers } from "./types";
import type { IInjectedMessageData, IInjectedProviderRequest } from "@cryptkeeperzk/types";

import { type EventHandler, EventEmitter, EventName } from "../event";

const EVENTS = Object.values(EventName);

export class Handler {
  /**
   * Nonce used for message communication.
   */
  private nonce: number;

  /**
   * EventEmitter for handling events.
   */
  private emitter: EventEmitter;

  /**
   * Stores promises associated with message nonces.
   */
  private requestsPromises: Map<string, RequestsPromisesHandlers>;

  /**
   * Connected origin
   */
  private connectedOrigin?: string;

  /**
   * Creates an instance of CryptKeeperInjectedProvider.
   *
   * @constructor
   */
  constructor(connectedOrigin?: string) {
    this.nonce = 0;
    this.connectedOrigin = connectedOrigin;
    this.emitter = new EventEmitter();
    this.requestsPromises = new Map<string, RequestsPromisesHandlers>();
  }

  getConnectedOrigin(): string | undefined {
    return this.connectedOrigin;
  }

  on(eventName: EventName, cb: EventHandler): void {
    this.emitter.on(eventName, cb);
  }

  emit(eventName: EventName, payload?: unknown): void {
    this.emitter.emit(eventName, payload);
  }

  cleanListeners(): void {
    this.emitter.cleanListeners();
  }

  /**
   * Sends a message to the extension.
   *
   * @param {IInjectedProviderRequest} message - The message to send.
   * @returns {Promise<unknown>} A Promise that resolves to the response from the extension.
   */
  async request(message: IInjectedProviderRequest): Promise<unknown> {
    // TODO: (#75) enhance by moving towards long-lived connections #75
    return new Promise((resolve, reject) => {
      const messageNonce = this.nonce;
      this.nonce += 1;

      window.postMessage(
        {
          target: "injected-contentscript",
          message: {
            ...message,
            meta: {
              ...message.meta,
              urlOrigin: this.connectedOrigin,
            },
            type: message.method,
          },
          nonce: messageNonce,
        },
        "*",
      );

      this.requestsPromises.set(messageNonce.toString(), { resolve, reject });
    });
  }

  /**
   * Handles incoming messages from the extension.
   *
   * @param {IInjectedMessageData} event - The message event.
   * @returns {unknown} The result of handling the event.
   */
  eventResponser(event: MessageEvent<IInjectedMessageData>): unknown {
    const { data } = event;

    if (data.target === "injected-injectedscript") {
      if (EVENTS.includes(data.nonce as EventName)) {
        const [, res] = data.payload;
        this.emit(data.nonce as EventName, res);
        return;
      }

      if (!this.requestsPromises.has(data.nonce.toString())) {
        return;
      }

      const [err, res] = data.payload;
      const { reject, resolve } = this.requestsPromises.get(data.nonce.toString())!;

      if (err) {
        reject(new Error(err));
        return;
      }

      resolve(res);

      this.requestsPromises.delete(data.nonce.toString());
    }
  }
}
