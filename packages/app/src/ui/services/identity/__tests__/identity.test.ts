import { ZERO_ADDRESS } from "@src/config/const";

import type { JsonRpcSigner } from "ethers";

import { getMessageTemplate, signWithSigner } from "..";

describe("ui/services/identity", () => {
  test("should sign message properly for interep strategy", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockResolvedValue("signed-interep"),
    };

    const message = getMessageTemplate({
      identityStrategyType: "interep",
      nonce: 0,
      web2Provider: "twitter",
      account: ZERO_ADDRESS,
    });
    const result = await signWithSigner({
      message,
      signer: mockSigner as unknown as JsonRpcSigner,
    });

    expect(mockSigner.signMessage).toBeCalledTimes(1);
    expect(mockSigner.signMessage).toBeCalledWith(
      `Sign this message with account ${ZERO_ADDRESS} to generate your twitter Semaphore identity with key nonce: 0`,
    );
    expect(result).toBe("signed-interep");
  });

  test("should sign message properly for random strategy", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockResolvedValue("signed-random"),
    };

    const message = getMessageTemplate({ identityStrategyType: "random", account: ZERO_ADDRESS });
    const result = await signWithSigner({
      message,
      signer: mockSigner as unknown as JsonRpcSigner,
    });

    expect(mockSigner.signMessage).toBeCalledTimes(1);
    expect(mockSigner.signMessage).toBeCalledWith(
      `Sign this message with account ${ZERO_ADDRESS} to generate your random Semaphore identity`,
    );
    expect(result).toBe("signed-random");
  });

  test("should throw user rejected error", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockRejectedValue({ message: "user rejected signing", code: "ACTION_REJECTED" }),
    };

    const message = getMessageTemplate({ identityStrategyType: "random", account: ZERO_ADDRESS });
    await expect(signWithSigner({ message, signer: mockSigner as unknown as JsonRpcSigner })).rejects.toThrowError(
      "User rejected signing",
    );
  });

  test("should throw sign error", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockRejectedValue(new Error("error")),
    };

    const message = getMessageTemplate({ identityStrategyType: "random", account: ZERO_ADDRESS });
    await expect(signWithSigner({ message, signer: mockSigner as unknown as JsonRpcSigner })).rejects.toThrowError(
      "error",
    );
  });

  test("should return undefined if there is no signer", async () => {
    const result = await signWithSigner({
      message: "",
    });

    expect(result).toBeUndefined();
  });
});
