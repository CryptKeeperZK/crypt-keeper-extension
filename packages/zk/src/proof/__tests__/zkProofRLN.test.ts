import { ZkIdentitySemaphore } from "@src/identity";

import type { IRLNGenerateArgs } from "@cryptkeeperzk/types";

import { ZkProofService, RLNProofService } from "..";

jest.mock("@src/identity", (): unknown => ({
  ZkIdentitySemaphore: {
    genFromSerialized: jest.fn(),
  },
}));

jest.mock("../protocols");

describe("RLN proof", () => {
  const defaultGenerateArgs: IRLNGenerateArgs = {
    identity: "identity",
    payload: {
      circuitFilePath: "circuitFilePath",
      zkeyFilePath: "zkeyFilePath",
      rlnIdentifier: "rlnIdentifier",
      message: "message",
      messageId: 1,
      messageLimit: 0,
      epoch: "1",
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
