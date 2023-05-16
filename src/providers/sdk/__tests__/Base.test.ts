/**
 * @jest-environment jsdom
 */
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

jest.useRealTimers();

const createTimeout = (): Promise<void> =>
    new Promise((resolve) => {
      // need to wait until we get popup and add request to queue
      setTimeout(resolve, 10000);
    });

describe("providers/sdk/Base", () => {
    test("Should be able to check if it is CK provider", () => {
        const provider = new CryptKeeperInjectedProvider();
        expect(provider.isCryptKeeper).toBe(true);
    });

    test("Should be able to use the provider to make a connection", async () => {
        const postMessageSpy = jest.spyOn(window, "postMessage");
        //postMessageSpy.mockResolvedValue(["Result", null])
        (window.postMessage as jest.Mock).mockResolvedValue(["Result", null]);
        const provider = new CryptKeeperInjectedProvider();
        (provider.connect as jest.Mock).mockResolvedValue(provider)
        const client = await provider.connect();
        expect(client).toBe(provider);
    });
});