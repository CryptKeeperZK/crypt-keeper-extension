/**
 * @jest-environment jsdom
 */
/* eslint @typescript-eslint/no-explicit-any: 0 */ // --> OFF
import { CryptKeeperInjectedProvider } from "..";

jest.mock("@src/background/services/event", (): unknown => ({
  __esModule: true,
  default: jest.fn().mockImplementation(),
}));

jest.mock("@src/background/services/zkProof", (): unknown => ({
  __esModule: true,
  default: {
    getInstance: jest.fn(),
  },
}));

describe("providers/sdk/Base", () => {
  const mockApprovals = {
    isApproved: true,
    canSkipApprove: true,
  };

  beforeEach(() => {
    // Mocking private dependencies
    const mockTryInject = jest.spyOn(CryptKeeperInjectedProvider.prototype as any, "tryInject");
    mockTryInject.mockResolvedValue(mockApprovals);

    const mockAddHost = jest.spyOn(CryptKeeperInjectedProvider.prototype as any, "addHost");
    mockAddHost.mockResolvedValue(null);

    const mockClosePopup = jest.spyOn(CryptKeeperInjectedProvider.prototype as any, "closePopup");
    mockClosePopup.mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should be able to check if it is CK provider", () => {
    const provider = new CryptKeeperInjectedProvider();
    expect(provider.isCryptKeeper).toBe(true);
  });

  test("Should be able to use the provider to make a connection", async () => {
    const postMessageSpy = jest.spyOn(window, "postMessage");
    const mockPost = jest.spyOn(CryptKeeperInjectedProvider.prototype as any, "post");
    // postMessageSpy.mockResolvedValue(["Result", null])
    // (window.postMessage as jest.Mock).mockResolvedValue(["Result", null]);
    // TODO: how to either check if window.postMessage or this.post function have been called? even though they are mocked in beforeEach
    // expect(postMessageSpy).toHaveBeenCalledTimes(3);
    // expect(mockPost).toHaveBeenCalledTimes(3);
    const provider = new CryptKeeperInjectedProvider();
    const client = await provider.connect();
    expect(client).toBe(provider);
  });
});
