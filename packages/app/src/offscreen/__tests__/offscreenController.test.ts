import { MerkleProof, ISemaphoreProofRequest } from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, getMerkleProof } from "@cryptkeeperzk/zk";

import { mockSemaphoreGenerateProof } from "../mocks";
import { OffscreenController } from "../Offscreen";

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
  ZkIdentitySemaphore: {
    genFromSerialized: jest.fn(),
    genIdentityCommitment: jest.fn(),
  },
  getMerkleProof: jest.fn(),
  ZkProofService: jest.fn(() => ({
    generateSemaphoreProof: mockSemaphoreGenerateProof,
    generateRLNProof: jest.fn(),
  })),
}));

const emptyFullProof = {
  fullProof: {
    proof: {},
    publicSignals: {},
  },
};

describe("offscreen/offscreenController", () => {
  const defaultGenerateArgs: ISemaphoreProofRequest = {
    identitySerialized: "identitySerialized",
    externalNullifier: "externalNullifier",
    signal: "0x0",
    circuitFilePath: "circuitFilePath",
    verificationKey: "verificationKey",
    zkeyFilePath: "zkeyFilePath",
  };

  const defaultMerkleProof: MerkleProof = {
    root: 0n,
    leaf: 1n,
    siblings: [],
    pathIndices: [],
  };

  beforeEach(() => {
    (ZkIdentitySemaphore.genFromSerialized as jest.Mock).mockReturnValue({
      genIdentityCommitment: jest.fn().mockReturnValue("identityCommitment"),
      zkIdentity: "zkIdentity",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should be able to generate a semaphore proof", async () => {
    (getMerkleProof as jest.Mock).mockReturnValue(defaultMerkleProof);
    mockSemaphoreGenerateProof.mockResolvedValueOnce(emptyFullProof);

    const offscreenController = new OffscreenController();
    offscreenController.initialize();

    const result = await offscreenController.generateSemaphoreProof(defaultGenerateArgs);

    expect(result).toStrictEqual(emptyFullProof);
  });
});
