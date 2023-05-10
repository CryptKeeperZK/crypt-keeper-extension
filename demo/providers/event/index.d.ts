import { EventHandler, EventName } from "./types";
export default class EventEmitter {
    private emitter;
    constructor();
    on(eventName: EventName, cb: EventHandler): void;
    emit: (eventName: EventName, payload?: unknown) => void;
    cleanListeners(): void;
}
