import EventEmitter from "..";
import { Events, EventHandler, EventName } from "../types";

const events: Events = {
  identityChanged: () => false,
  login: () => false,
  logout: () => false,
};

jest.mock("nanoevents", (): unknown => ({
  createNanoEvents: jest.fn(() => ({
    on: jest.fn().mockImplementation((eventName: EventName, cb: EventHandler) => {
      events[eventName] = cb;
    }),
    emit: jest.fn().mockImplementation((eventName: EventName, payload: number) => {
      const cb = events[eventName];
      cb(payload);
    }),
  })),
}));

describe("background/services/event", () => {
  test("Should be able to add new event listeners", () => {
    let eventCondition = 1;
    const eventHandler = jest.fn((payload: unknown): void => {
      eventCondition = payload as number;
    });
    const eventEmitter = new EventEmitter();

    eventEmitter.on("identityChanged", eventHandler);
    expect(eventHandler.mock.calls.length).toBe(0);
    eventEmitter.emit("identityChanged", 2);
    const cbSpy = jest.spyOn(eventEmitter.emitter, "emit");
    expect(cbSpy).toHaveBeenCalledWith("identityChanged", 2);
    expect(cbSpy).toHaveBeenCalledTimes(1);
    expect(eventHandler.mock.calls.length).toBe(1);
    expect(eventHandler.mock.calls[0][0]).toBe(2);
    expect(eventCondition).toBe(2);
    eventEmitter.emit("identityChanged", 3);
    expect(eventHandler.mock.calls.length).toBe(2);
    expect(eventHandler.mock.calls[1][0]).toBe(3);
    expect(eventCondition).toBe(3);
  });

  test("Should be able to clear events listeners", () => {
    let eventCondition = false;
    const eventHandler = (): void => {
      eventCondition = !eventCondition;
    };
    const eventEmitter = new EventEmitter();

    eventEmitter.on("identityChanged", eventHandler);
    eventEmitter.emit("identityChanged");
    expect(eventCondition).toBe(true);
    eventEmitter.emit("identityChanged");
    expect(eventCondition).toBe(false);
    eventEmitter.cleanListeners();
    expect(eventCondition).toBe(false);
  });
});
