import { IMerkleProof, IRLNProofRequest, ISemaphoreProofRequest } from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, getMerkleProof } from "@cryptkeeperzk/zk";

import { OffscreenController } from "../Offscreen";

const mockEmptyFullProof = {
  fullProof: {
    proof: {},
    publicSignals: {},
  },
};

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
  ZkIdentitySemaphore: {
    genFromSerialized: jest.fn(),
    genIdentityCommitment: jest.fn(),
  },
  getMerkleProof: jest.fn(),
  ZkProofService: jest.fn(() => ({
    generateSemaphoreProof: jest.fn(() => Promise.resolve(mockEmptyFullProof)),
    generateRLNProof: jest.fn(() => Promise.resolve(mockEmptyFullProof)),
  })),
}));

describe("offscreen/offscreenController", () => {
  const defaultSemaphoreProofArgs: ISemaphoreProofRequest = {
    identitySerialized: "identitySerialized",
    externalNullifier: "externalNullifier",
    signal: "0x0",
    circuitFilePath: "circuitFilePath",
    verificationKey: "verificationKey",
    zkeyFilePath: "zkeyFilePath",
    urlOrigin: "origin",
  };

  const defaultRlnProofArgs: IRLNProofRequest = {
    identitySerialized: "identitySerialized",
    rlnIdentifier: "id",
    message: "message",
    messageLimit: 1,
    messageId: 0,
    epoch: "epoch",
  };

  const defaultMerkleProof: IMerkleProof = {
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

    (getMerkleProof as jest.Mock).mockReturnValue(defaultMerkleProof);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should not handle unknown requests", async () => {
    const offscreenController = new OffscreenController();

    await expect(offscreenController.handle({ method: "unknown" }, {})).rejects.toThrowError(
      "method: unknown is not detected",
    );
  });

  test("should generate semaphore proof properly", async () => {
    const offscreenController = new OffscreenController();
    offscreenController.initialize();

    const result = await offscreenController.generateSemaphoreProof(defaultSemaphoreProofArgs);

    expect(result).toStrictEqual(mockEmptyFullProof);
  });

  test("should throw error while generating semaphore proof if there is no serialized identity", async () => {
    const offscreenController = new OffscreenController();
    offscreenController.initialize();

    await expect(
      offscreenController.generateSemaphoreProof({ ...defaultSemaphoreProofArgs, identitySerialized: "" }),
    ).rejects.toThrowError("Offscreen: Serialized Identity is not set");
  });

  test("should generate rln proof properly", async () => {
    const offscreenController = new OffscreenController();
    offscreenController.initialize();

    const result = await offscreenController.generateRlnProof(defaultRlnProofArgs);

    expect(result).toStrictEqual(mockEmptyFullProof);
  });

  test("should throw error while generating rnl proof if there is no serialized identity", async () => {
    const offscreenController = new OffscreenController();
    offscreenController.initialize();

    await expect(
      offscreenController.generateRlnProof({ ...defaultRlnProofArgs, identitySerialized: "" }),
    ).rejects.toThrowError("Offscreen: Serialized Identity is not set");
  });
});
