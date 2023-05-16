import type { JsonRpcSigner } from "ethers/types/providers";

import { getMessageTemplate, signWithSigner } from "..";

describe("ui/services/identity", () => {
  test("should sign message properly for interrep strategy", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockResolvedValue("signed-interrep"),
    };

    const message = getMessageTemplate({ identityStrategyType: "interrep", nonce: 0, web2Provider: "twitter" });
    const result = await signWithSigner({
      message,
      signer: mockSigner as unknown as JsonRpcSigner,
    });

    expect(mockSigner.signMessage).toBeCalledTimes(1);
    expect(mockSigner.signMessage).toBeCalledWith(
      "Sign this message to generate your twitter identity with key nonce: 0",
    );
    expect(result).toBe("signed-interrep");
  });

  test("should sign message properly for random strategy", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockResolvedValue("signed-random"),
    };

    const message = getMessageTemplate({ identityStrategyType: "random" });
    const result = await signWithSigner({
      message,
      signer: mockSigner as unknown as JsonRpcSigner,
    });

    expect(mockSigner.signMessage).toBeCalledTimes(1);
    expect(mockSigner.signMessage).toBeCalledWith("Sign this message to generate your random identity");
    expect(result).toBe("signed-random");
  });

  test("should return undefined if there is no signer", async () => {
    const result = await signWithSigner({
      message: "",
    });

    expect(result).toBeUndefined();
  });
});
