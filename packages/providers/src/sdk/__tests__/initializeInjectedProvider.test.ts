/**
 * @jest-environment jsdom
 */

import { CryptKeeperInjectedProvider, initializeCryptKeeper, initializeCryptKeeperProvider } from "..";

jest.mock("nanoevents", (): unknown => ({
  createNanoEvents: jest.fn(),
}));

jest.mock("../CryptKeeperInjectedProvider", (): unknown => ({
  ...jest.requireActual("../CryptKeeperInjectedProvider"),
  CryptKeeperInjectedProvider: jest.fn(),
}));

describe("sdk/initializeInjectedProvider", () => {
  const defaultProvider = {
    request: jest.fn(),
    eventResponser: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
    cleanListeners: jest.fn(),
    getConnectedOrigin: jest.fn(),
  };

  beforeEach(() => {
    (CryptKeeperInjectedProvider as jest.Mock).mockReturnValue(defaultProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
    window.isCryptkeeperInjected = true;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window.cryptkeeper = undefined;
  });

  test("should initialize cryptkeeper properly", () => {
    const provider = initializeCryptKeeper();

    expect(provider).toStrictEqual(defaultProvider);
    expect(window.cryptkeeper).toStrictEqual(provider);
    expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
  });

  test("should initialize cryptkeeper for extension properly", () => {
    const provider = initializeCryptKeeperProvider();

    expect(provider).toStrictEqual(defaultProvider);
    expect(window.cryptkeeper).toStrictEqual(provider);
    expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
    expect(window.addEventListener).toHaveBeenCalledTimes(1);
  });

  test("should not initialize if cryptkeeper is not injected", () => {
    window.isCryptkeeperInjected = false;
    const provider = initializeCryptKeeper();

    expect(provider).toBeUndefined();
    expect(window.cryptkeeper).toBeUndefined();
    expect(window.dispatchEvent).toHaveBeenCalledTimes(0);
    expect(window.addEventListener).toHaveBeenCalledTimes(0);
  });
});
