import EventEmitter from "..";
import { Events, EventHandler, EventName } from "../types";

const events: Events = {
  identityChanged: () => false,
  login: () => false,
  logout: () => false,
};

jest.mock("nanoevents", (): unknown => ({
  __esModule: true,
  createNanoEvents: jest.fn(() => ({
    on: jest.fn().mockImplementation((eventName: EventName, cb: EventHandler) => {
      events[eventName] = cb;
    }),
    emit: jest.fn().mockImplementation((eventName: EventName) => {
      const cb = events[eventName];
      cb();
    }),
  })),
}));

describe("background/services/event", () => {
  test("Should be able to add new event listeners", () => {
    let eventCondition = false;
    const eventHandler = (): void => {
      eventCondition = !eventCondition;
    };
    const eventEmitter = new EventEmitter();

    eventEmitter.on("identityChanged", eventHandler);
    eventEmitter.emit("identityChanged");
    // TOOD: check if the evnetHandler function is called or not.
    // const cbSpy = jest.spyOn(events, "identityChanged");
    // expect(cbSpy).toHaveBeenCalledWith(eventCondition); => Gives error still
    expect(eventCondition).toBe(true);
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
