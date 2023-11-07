import { type Emitter, createNanoEvents } from "nanoevents";

import type { Events, EventHandler, EventName } from "./types";

/**
 * Event emitter class that allows subscribing to and emitting events.
 *
 * @class
 */
export class EventEmitter {
  /**
   * The internal emitter instance.
   */
  private emitter: Emitter<Events>;

  /**
   * Creates an instance of EventEmitter.
   *
   * @constructor
   */
  constructor() {
    this.emitter = createNanoEvents<Events>();
  }

  /**
   * Subscribes to an event.
   *
   * @param {EventName} eventName - The name of the event to subscribe to.
   * @param {EventHandler} cb - The event handler callback function.
   * @returns {void}
   */
  on = (eventName: EventName, cb: EventHandler): void => {
    this.emitter.on(eventName, cb);
  };

  /**
   * Emits an event.
   *
   * @param {EventName} eventName - The name of the event to emit.
   * @param {unknown} [payload] - Optional payload to pass to the event handlers.
   * @returns {void}
   */
  emit = (eventName: EventName, payload?: unknown): void => {
    this.emitter.emit(eventName, payload);
  };

  /**
   * Cleans up all the listeners.
   *
   * @returns {void}
   */
  cleanListeners = (): void => {
    this.emitter.events = {};
  };
}
