/**
 * @jest-environment jsdom
 */
/* eslint no-console: 0 */ // --> OFF
import { ZERO_ADDRESS } from "@src/config/const";
import { RPCAction } from "@src/constants";
import { Approvals, InjectedMessageData, InjectedProviderRequest } from "@src/types";

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
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should be able to check if it is CK provider", () => {
    const provider = new CryptKeeperInjectedProvider();
    expect(provider.isCryptKeeper).toBe(true);
  });

  test("Should be able to use the provider to make a connection", async () => {
    // Mock contentscript returns
    window.addEventListener("message", (event: MessageEvent<InjectedMessageData>) => {
      const { data } = event;

      if (data && data.target === "injected-contentscript") {
        const message = data.message as InjectedProviderRequest;

        console.log("Inside Contentscript addEventListener", data.message);

        let res: unknown;

        if (message.method === RPCAction.TRY_INJECT) {
          console.log("Inside Contentscript TRY_INJECT");

          res = {
            isApproved: true,
            canSkipApprove: true,
          } as Approvals;
        }

        if (message.method === RPCAction.APPROVE_HOST) {
          console.log("Inside Contentscript APPROVE_HOST");

          res = null;
        }

        if (message.method === RPCAction.GET_ACCOUNTS) {
          console.log("Inside Contentscript GET_ACCOUNTS");

          res = [ZERO_ADDRESS];
        }

        if (message.method === RPCAction.CLOSE_POPUP) {
          console.log("Inside Contentscript CLOSE_POPUP");

          res = null;
        }

        window.postMessage(
          {
            target: "injected-injectedscript",
            payload: [null, res],
            nonce: data.nonce,
          },
          "*",
        );
      }
    });

    // Mock contentscript handler
    const addEvenListenerSpy = jest.spyOn(window, "addEventListener");
    const postMessageSpy = jest.spyOn(window, "postMessage");

    const injectedProvider = new CryptKeeperInjectedProvider();

    window.addEventListener("message", injectedProvider.eventResponser);
    console.log("Started");
    await injectedProvider.connect();
    console.log("Finished");
    expect(postMessageSpy).toHaveBeenCalledTimes(4);
    expect(addEvenListenerSpy).toHaveBeenCalledTimes(3);
  });
});
