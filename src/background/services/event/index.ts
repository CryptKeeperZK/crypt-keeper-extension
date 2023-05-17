import { Emitter, createNanoEvents } from "nanoevents";

import { Events, EventHandler, EventName } from "./types";

export default class EventEmitter {
  emitter: Emitter<Events>;

  constructor() {
    this.emitter = createNanoEvents<Events>();
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
