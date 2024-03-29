import type { ICryptKeeperInjectedProvider } from "./interface";
import type { IInjectedMessageData, IInjectedProviderRequest } from "@cryptkeeperzk/types";

import { RPCExternalAction } from "../constants";
import { type EventHandler, type EventName, Handler } from "../services";

/**
 * Represents the CryptKeeper provider that is injected into the application.
 * This class is responsible for handling interactions with the CryptKeeper extension.
 *
 * @class
 */
export class CryptKeeperInjectedProvider implements ICryptKeeperInjectedProvider {
  /**
   * Handler service
   */
  private readonly handler: Handler;

  /**
   * Indicates whether the provider is CryptKeeper.
   */
  readonly isCryptKeeper = true;

  /**
   * Creates an instance of CryptKeeperInjectedProvider.
   *
   * @constructor
   */
  constructor(connectedOrigin?: string) {
    this.handler = new Handler(connectedOrigin);
  }

  /**
   * Connects to the CryptKeeper extension.
   *
   * @returns {Promise<void>}
   */
  connect = async (isChangeIdentity = false): Promise<void> => {
    await this.request({
      method: RPCExternalAction.CONNECT,
      payload: {
        isChangeIdentity,
        urlOrigin: this.handler.getConnectedOrigin(),
      },
    });
  };

  /**
   * Sends a message to the extension.
   *
   * @param {IInjectedProviderRequest} message - The message to send.
   * @returns {Promise<unknown>} A Promise that resolves to the response from the extension.
   */
  request = async (message: IInjectedProviderRequest): Promise<unknown> => this.handler.request(message);

  /**
   * Handles incoming messages from the extension.
   *
   * @param {IInjectedMessageData} event - The message event.
   * @returns {unknown} The result of handling the event.
   */
  eventResponser = (event: MessageEvent<IInjectedMessageData>): unknown => this.handler.eventResponser(event);

  on = (eventName: EventName, cb: EventHandler): void => {
    this.handler.on(eventName, cb);
  };

  emit = (eventName: EventName, payload?: unknown): void => {
    this.handler.emit(eventName, payload);
  };

  cleanListeners = (): void => {
    this.handler.cleanListeners();
  };
}
