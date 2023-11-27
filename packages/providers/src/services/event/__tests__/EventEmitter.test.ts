/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/unbound-method */
import { type Emitter, createNanoEvents } from "nanoevents";

import { EventEmitter, EventName } from "..";

jest.mock("nanoevents", (): unknown => ({
  createNanoEvents: jest.fn(),
}));

describe("services/event", () => {
  const defaultEventEmitter: Emitter = {
    events: {},
    on: jest.fn(),
    emit: jest.fn(),
  };

  const defaultHandler = jest.fn();

  beforeEach(() => {
    (createNanoEvents as jest.Mock).mockReturnValue(defaultEventEmitter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle events properly", () => {
    const eventEmitter = new EventEmitter();

    eventEmitter.on(EventName.CONNECT, defaultHandler);
    eventEmitter.emit(EventName.CONNECT, { data: true });
    eventEmitter.cleanListeners();

    expect(defaultEventEmitter.on).toHaveBeenCalledTimes(1);
    expect(defaultEventEmitter.emit).toHaveBeenCalledTimes(1);
  });
});
