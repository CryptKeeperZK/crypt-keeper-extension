import { ZERO_ADDRESS } from "@src/config/const";
import { mockDefaultNullifier, mockDefaultTrapdoor } from "@src/config/mock/zk";

import type { JsonRpcSigner } from "ethers";

import { getImportMessageTemplate, getMessageTemplate, signWithSigner } from "..";

describe("ui/services/identity", () => {
  test("should sign message properly", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockResolvedValue("signed"),
    };

    const message = getMessageTemplate({
      account: ZERO_ADDRESS,
      nonce: 0,
    });
    const result = await signWithSigner({
      message,
      signer: mockSigner as unknown as JsonRpcSigner,
    });

    expect(mockSigner.signMessage).toBeCalledTimes(1);
    expect(mockSigner.signMessage).toBeCalledWith(
      `Sign this message with account ${ZERO_ADDRESS} to generate your Semaphore identity with key nonce: 0`,
    );
    expect(result).toBe("signed");
  });

  test("should sign import message properly", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockResolvedValue("signed"),
    };

    const message = getImportMessageTemplate({
      account: ZERO_ADDRESS,
      trapdoor: mockDefaultTrapdoor,
      nullifier: mockDefaultNullifier,
    });
    const result = await signWithSigner({
      message,
      signer: mockSigner as unknown as JsonRpcSigner,
    });

    expect(mockSigner.signMessage).toBeCalledTimes(1);
    expect(mockSigner.signMessage).toBeCalledWith(
      `Sign this message with account ${ZERO_ADDRESS} to import your Semaphore identity with trapdoor: ${mockDefaultTrapdoor}, nullifier: ${mockDefaultNullifier}`,
    );
    expect(result).toBe("signed");
  });

  test("should throw user rejected error", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockRejectedValue({ message: "user rejected signing", code: "ACTION_REJECTED" }),
    };

    const message = getMessageTemplate({ account: ZERO_ADDRESS, nonce: 0 });
    await expect(signWithSigner({ message, signer: mockSigner as unknown as JsonRpcSigner })).rejects.toThrowError(
      "User rejected signing",
    );
  });

  test("should throw sign error", async () => {
    const mockSigner = {
      signMessage: jest.fn().mockRejectedValue(new Error("error")),
    };

    const message = getMessageTemplate({ account: ZERO_ADDRESS, nonce: 0 });
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
