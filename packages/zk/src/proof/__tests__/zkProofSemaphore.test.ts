import { ZkIdentitySemaphore } from "@src/identity";

import type { ISemaphoreGenerateArgs } from "@cryptkeeper/types";

import { ZkProofService } from "..";
import { SemaphoreProofService } from "../protocols";

jest.mock("@src/identity", (): unknown => ({
  ZkIdentitySemaphore: {
    genFromSerialized: jest.fn(),
  },
}));

jest.mock("../protocols");

describe("Semaphore proof", () => {
  const defaultGenerateArgs: ISemaphoreGenerateArgs = {
    identity: "identity",
    payload: {
      externalNullifier: "externalNullifier",
      signal: "0x0",
      circuitFilePath: "circuitFilePath",
      verificationKey: "verificationKey",
      zkeyFilePath: "zkeyFilePath",
    },
  };

  const emptyFullProof = {
    fullProof: {
      proof: {},
      publicSignals: {},
    },
  };

  beforeEach(() => {
    (ZkIdentitySemaphore.genFromSerialized as jest.Mock).mockReturnValue("serialized");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should generate semaphore proof properly", async () => {
    const zkProofGenerator = ZkProofService.getInstance();
    const [semaphoreServiceInstance] = (SemaphoreProofService as jest.Mock).mock.instances as [{ genProof: jest.Mock }];
    semaphoreServiceInstance.genProof.mockResolvedValue(emptyFullProof);

    const result = await zkProofGenerator.generateSemaphoreProof(
      ZkIdentitySemaphore.genFromSerialized(defaultGenerateArgs.identity),
      defaultGenerateArgs.payload,
    );

    expect(semaphoreServiceInstance.genProof).toBeCalledTimes(1);
    expect(semaphoreServiceInstance.genProof).toBeCalledWith("serialized", defaultGenerateArgs.payload);
    expect(result).toStrictEqual(emptyFullProof);
  });
});
