/**
 * @jest-environment jsdom
 */
import { RPCExternalAction } from "@src/constants";

import type { IInjectedMessageData } from "@cryptkeeperzk/types";

import { CryptKeeperInjectedProvider } from "..";
import { EventName, Handler } from "../../services";

jest.mock("nanoevents", (): unknown => ({
  createNanoEvents: jest.fn(),
}));

jest.mock("../../services", (): unknown => ({
  ...jest.requireActual("../../services"),
  Handler: jest.fn(),
}));

describe("sdk/CryptKeeperInjectedProvider", () => {
  const defaultHandler = {
    request: jest.fn(),
    eventResponser: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
    cleanListeners: jest.fn(),
    getConnectedOrigin: jest.fn(),
  };

  beforeEach(() => {
    (Handler as jest.Mock).mockReturnValue(defaultHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should connect properly", async () => {
    const provider = new CryptKeeperInjectedProvider();

    await provider.connect();

    expect(defaultHandler.request).toHaveBeenCalledTimes(1);
    expect(defaultHandler.request).toHaveBeenCalledWith({
      method: RPCExternalAction.CONNECT,
      payload: {
        isChangeIdentity: false,
        urlOrigin: undefined,
      },
    });
  });

  test("should request rpc properly", async () => {
    const provider = new CryptKeeperInjectedProvider();

    await provider.request({ method: RPCExternalAction.GET_CONNECTED_IDENTITY_DATA });

    expect(defaultHandler.request).toHaveBeenCalledTimes(1);
    expect(defaultHandler.request).toHaveBeenCalledWith({
      method: RPCExternalAction.GET_CONNECTED_IDENTITY_DATA,
    });
  });

  test("should handle events properly", () => {
    const provider = new CryptKeeperInjectedProvider();

    provider.eventResponser({} as MessageEvent<IInjectedMessageData>);
    provider.on(EventName.CONNECT, jest.fn());
    provider.emit(EventName.CONNECT, { data: true });
    provider.cleanListeners();

    expect(defaultHandler.eventResponser).toHaveBeenCalledTimes(1);
    expect(defaultHandler.on).toHaveBeenCalledTimes(1);
    expect(defaultHandler.emit).toHaveBeenCalledTimes(1);
    expect(defaultHandler.emit).toHaveBeenCalledWith(EventName.CONNECT, { data: true });
    expect(defaultHandler.cleanListeners).toHaveBeenCalledTimes(1);
  });
});
