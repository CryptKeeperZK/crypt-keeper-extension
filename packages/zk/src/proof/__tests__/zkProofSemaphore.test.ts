import { ZkIdentitySemaphore } from "@src/identity";

import type { ISemaphoreGenerateArgs } from "@cryptkeeperzk/types";

import { ZkProofService, SemaphoreProofService } from "..";

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
      signal: "0x0",
      externalNullifier: "externalNullifier",
      circuitFilePath: "circuitFilePath",
      zkeyFilePath: "zkeyFilePath",
      merkleProofArtifacts: {
        leaves: ["0"],
        depth: 1,
        leavesPerNode: 1,
      },
      merkleProofProvided: {
        root: "0",
        leaf: "0",
        siblings: ["0"],
        pathIndices: [0],
      },
      merkleStorageUrl: "merkleStorageUrl",
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

    expect(semaphoreServiceInstance.genProof).toHaveBeenCalledTimes(1);
    expect(semaphoreServiceInstance.genProof).toHaveBeenCalledWith("serialized", defaultGenerateArgs.payload);
    expect(result).toStrictEqual(emptyFullProof);
  });
});
