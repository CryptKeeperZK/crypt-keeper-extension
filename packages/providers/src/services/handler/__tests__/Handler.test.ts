/**
 * @jest-environment jsdom
 */
import type { IInjectedMessageData, IInjectedProviderRequest } from "@cryptkeeperzk/types";

import { Handler, EventEmitter, EventName } from "../..";

jest.mock("nanoevents", (): unknown => ({
  createNanoEvents: jest.fn(),
}));

jest.mock("../../event", (): unknown => ({
  ...jest.requireActual("../../event"),
  EventEmitter: jest.fn(),
}));

describe("services/handler", () => {
  const defaultEventEmitter = {
    on: jest.fn(),
    emit: jest.fn(),
    cleanListeners: jest.fn(),
  };

  const defaultMessage: IInjectedProviderRequest = {
    method: EventName.CONNECT,
  };

  const defaultEvent = {
    data: {
      target: "injected-injectedscript",
      nonce: "0",
      payload: ["", { data: true }],
    },
  } as MessageEvent<IInjectedMessageData>;

  beforeEach(() => {
    (EventEmitter as jest.Mock).mockReturnValue(defaultEventEmitter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle events properly", () => {
    const handler = new Handler();

    handler.on(EventName.CONNECT, jest.fn());
    handler.emit(EventName.CONNECT, { data: true });
    handler.cleanListeners();

    expect(defaultEventEmitter.on).toHaveBeenCalledTimes(1);
    expect(defaultEventEmitter.emit).toHaveBeenCalledTimes(1);
    expect(defaultEventEmitter.cleanListeners).toHaveBeenCalledTimes(1);
  });

  test("should get connected origin properly", () => {
    const handler = new Handler("url");

    const urlOrigin = handler.getConnectedOrigin();

    expect(urlOrigin).toBe("url");
  });

  test("should request rpc method properly", async () => {
    const handler = new Handler();

    const promise = handler.request(defaultMessage);
    handler.eventResponser(defaultEvent);

    await expect(promise).resolves.toStrictEqual(defaultEvent.data.payload[1]);
    expect(window.postMessage).toHaveBeenCalledTimes(1);
    expect(window.postMessage).toHaveBeenCalledWith(
      {
        target: "injected-contentscript",
        message: {
          ...defaultMessage,
          meta: {
            ...defaultMessage.meta,
            urlOrigin: undefined,
          },
          type: defaultMessage.method,
        },
        nonce: 0,
      },
      "*",
    );
  });

  test("should not handle unknown requests", () => {
    const handler = new Handler();

    handler.eventResponser({ ...defaultEvent, data: { ...defaultEvent.data, nonce: "unknown" } });
    handler.eventResponser({ ...defaultEvent, data: { ...defaultEvent.data, target: "unknown" } });

    expect(defaultEventEmitter.emit).toHaveBeenCalledTimes(0);
  });

  test("should handle event request properly", () => {
    const handler = new Handler();

    handler.eventResponser({ ...defaultEvent, data: { ...defaultEvent.data, nonce: EventName.CONNECT } });

    expect(defaultEventEmitter.emit).toHaveBeenCalledTimes(1);
    expect(defaultEventEmitter.emit).toHaveBeenCalledWith(EventName.CONNECT, defaultEvent.data.payload[1]);
  });

  test("should reject request properly", async () => {
    const handler = new Handler();

    const error = new Error("error");
    const promise = handler.request(defaultMessage);
    handler.eventResponser({ ...defaultEvent, data: { ...defaultEvent.data, payload: [error.message, null] } });

    await expect(promise).rejects.toStrictEqual(error);
    expect(window.postMessage).toHaveBeenCalledTimes(1);
    expect(window.postMessage).toHaveBeenCalledWith(
      {
        target: "injected-contentscript",
        message: {
          ...defaultMessage,
          meta: {
            ...defaultMessage.meta,
            urlOrigin: undefined,
          },
          type: defaultMessage.method,
        },
        nonce: 0,
      },
      "*",
    );
  });
});
