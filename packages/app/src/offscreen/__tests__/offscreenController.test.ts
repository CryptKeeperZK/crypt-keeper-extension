import { MerkleProof, SemaphoreProofRequest } from "@cryptkeeperzk/types";
import { ZkIdentitySemaphore, getMerkleProof } from "@cryptkeeperzk/zk";

import { OffscreenController } from "../Offscreen";

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
  ZkIdentitySemaphore: {
    genFromSerialized: jest.fn(),
    genIdentityCommitment: jest.fn(),
  },
  getMerkleProof: jest.fn(),
}));

const emptyFullProof = {
  fullProof: {
    proof: {},
    publicSignals: {},
  },
};

jest.mock("@cryptkeeperzk/semaphore-proof", (): unknown => ({
  generateProof: jest.fn(() => emptyFullProof),
}));

describe("offscreen/offscreenController", () => {
  const defaultGenerateArgs: SemaphoreProofRequest = {
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

  // test("should be able to initialize Offscreen controller", async () => {
  //     const offscreenController = new OffscreenController();
  //     //offscreenController.initialize();

  //     const mockRequest: RequestHandler = {
  //         method: RPCAction.GENERATE_SEMAPHORE_PROOF,
  //         source: "offscreen"
  //     }
  //     expect(await offscreenController.handle(mockRequest)).toThrow("method: undefined is not detected")
  // });

  // test("should be able to listen to GENERATE_SEMAPHORE_PROOF RPC call", async () => {
  //   const defaultSender = { url: "http://localhost:3000" };

  //   const offscreenController = new OffscreenController();
  //   offscreenController.initialize();

  //   const mockRequest: RequestHandler = {
  //     method: RPCAction.GENERATE_SEMAPHORE_PROOF,
  //     source: "offscreen",
  //   };

  //   await offscreenController.handle(mockRequest, defaultSender);
  //   Verify that the generateSemaphoreProof method was called
  //   TODO: how to test this probably
  //   expect(offscreenController.generateSemaphoreProof).toHaveBeenCalled();
  // });

  // test("should ignore non-offscreen messages", () => {
  //   const offscreenController = new OffscreenController();
  //   offscreenController.initialize();

  //   const mockRequest: RequestHandler = {
  //     method: RPCAction.GENERATE_SEMAPHORE_PROOF,
  //   };
  // });

  test("should be able to generate a semaphore proof", async () => {
    (getMerkleProof as jest.Mock).mockReturnValue(defaultMerkleProof);

    const offscreenController = new OffscreenController();
    offscreenController.initialize();

    const result = await offscreenController.generateSemaphoreProof(defaultGenerateArgs);

    expect(result).toStrictEqual(emptyFullProof);
  });
});
