import type { EventHandler, EventName } from "../services";
import type { IInjectedMessageData, IInjectedProviderRequest } from "@cryptkeeperzk/types";

/**
 * Extends the global Window interface to include CryptKeeper-related properties.
 */
declare global {
  /**
   * Represents the CryptKeeperInjectedProvider instance.
   */
  interface Window {
    /**
     * The CryptKeeperInjectedProvider instance.
     */
    cryptkeeper: ICryptKeeperInjectedProvider;

    /**
     * Indicates whether CryptKeeper is injected.
     */
    isCryptkeeperInjected?: boolean;
  }
}

/**
 * Represents the CryptKeeper provider that is injected into the application.
 * This class is responsible for handling interactions with the CryptKeeper extension.
 *
 * @interface
 */
export interface ICryptKeeperInjectedProvider {
  /**
   * Indicates whether the provider is CryptKeeper.
   */
  readonly isCryptKeeper: boolean;

  /**
   * Connects to the CryptKeeper extension.
   *
   * @returns {Promise<void>}
   */
  connect(isChangeIdentity?: boolean): Promise<void>;

  /**
   * Sends a message to the extension.
   *
   * @param {IInjectedProviderRequest} message - The message to send.
   * @returns {Promise<unknown>} A Promise that resolves to the response from the extension.
   */
  request(message: IInjectedProviderRequest): Promise<unknown>;

  /**
   * Handles incoming messages from the extension.
   *
   * @param {IInjectedMessageData} event - The message event.
   * @returns {unknown} The result of handling the event.
   */
  eventResponser(event: MessageEvent<IInjectedMessageData>): unknown;

  /**
   * Registers an event listener for the specified event.
   *
   * @param {EventName} eventName - The name of the event to listen for.
   * @param {EventHandler} cb - The callback function to be called when the event is triggered.
   * @returns {void}
   */
  on(eventName: EventName, cb: EventHandler): void;

  /**
   * Emits an event with the specified name and optional payload.
   *
   * @param {EventName} eventName - The name of the event to emit.
   * @param {unknown} payload - The optional payload to include with the event.
   * @returns {void}
   */
  emit(eventName: EventName, payload?: unknown): void;

  /**
   * Removes all event listeners.
   *
   * @returns {void}
   */
  cleanListeners(): void;
}
