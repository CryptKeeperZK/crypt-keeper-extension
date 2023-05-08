import { Emitter, createNanoEvents } from "nanoevents";

import { EventHandler, EventName } from "./types";

export default class EventEmitter {
  private emitter: Emitter;

  constructor() {
    this.emitter = createNanoEvents();
  }

  on(eventName: EventName, cb: EventHandler): void {
    this.emitter.on(eventName, cb);
  }

  emit = (eventName: EventName, payload?: unknown): void => {
    this.emitter.emit(eventName, payload);
  };

  cleanListeners(): void {
    this.emitter.events = {};
  }
}
