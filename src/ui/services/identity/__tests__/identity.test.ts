import type { JsonRpcSigner } from "@ethersproject/providers";

import { signIdentityMessage } from "..";

describe("ui/services/identity", () => {
  test("should sign message properly for interrep strategy", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockResolvedValue("signed-interrep"),
    };

    const result = await signIdentityMessage({
      identityStrategyType: "interrep",
      web2Provider: "twitter",
      nonce: 0,
      signer: mockSigner as unknown as JsonRpcSigner,
    });

    expect(mockSigner.signMessage).toBeCalledTimes(1);
    expect(mockSigner.signMessage).toBeCalledWith(
      "Sign this message to generate your twitter Semaphore identity with key nonce: 0",
    );
    expect(result).toBe("signed-interrep");
  });

  test("should sign message properly for random strategy", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockResolvedValue("signed-random"),
    };

    const result = await signIdentityMessage({
      identityStrategyType: "random",
      signer: mockSigner as unknown as JsonRpcSigner,
    });

    expect(mockSigner.signMessage).toBeCalledTimes(1);
    expect(mockSigner.signMessage).toBeCalledWith("Sign this message to generate your random Semaphore identity");
    expect(result).toBe("signed-random");
  });

  test("should return undefined if there is no signer", async () => {
    const result = await signIdentityMessage({
      identityStrategyType: "random",
    });

    expect(result).toBeUndefined();
  });
});
