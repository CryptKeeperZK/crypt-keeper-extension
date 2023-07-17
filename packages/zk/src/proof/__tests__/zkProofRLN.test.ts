import { ZkIdentitySemaphore } from "@src/identity";

import type { IRlnGenerateArgs } from "@cryptkeeperzk/types";

import { ZkProofService } from "..";
import { RLNProofService } from "../protocols";

jest.mock("@src/identity", (): unknown => ({
  ZkIdentitySemaphore: {
    genFromSerialized: jest.fn(),
  },
}));

jest.mock("../protocols");

describe("RLN proof", () => {
  const defaultGenerateArgs: IRlnGenerateArgs = {
    identity: "identity",
    payload: {
      identitySerialized: "identitySerialized",
      externalNullifier: "externalNullifier",
      signal: "0x0",
      circuitFilePath: "circuitFilePath",
      verificationKey: "verificationKey",
      zkeyFilePath: "zkeyFilePath",
      rlnIdentifier: "rlnIdentifier",
    },
  };

  const emptyFullProof = {
    proof: {},
    publicSignals: {},
  };

  beforeEach(() => {
    (ZkIdentitySemaphore.genFromSerialized as jest.Mock).mockReturnValue("serialized");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should generate rln proof properly", async () => {
    const zkProofGenerator = ZkProofService.getInstance();
    const [rlnServiceInstance] = (RLNProofService as jest.Mock).mock.instances as [{ genProof: jest.Mock }];
    rlnServiceInstance.genProof.mockResolvedValue(emptyFullProof);

    const result = await zkProofGenerator.generateRLNProof(
      ZkIdentitySemaphore.genFromSerialized(defaultGenerateArgs.identity),
      defaultGenerateArgs.payload,
    );

    expect(rlnServiceInstance.genProof).toBeCalledTimes(1);
    expect(rlnServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
    expect(result).toStrictEqual(emptyFullProof);
  });
});
