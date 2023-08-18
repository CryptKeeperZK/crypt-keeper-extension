import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { IdentityMetadata, IRlnProofRequest, ISemaphoreProofRequest } from "@cryptkeeperzk/types";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";

import { ZkIdentitySemaphore } from "@src/identity";

import { mockRlnGenerateProof, mockSemaphoreGenerateProof, emptyFullProof } from "../mocks";
import { RLNProofService } from "../RLNProof";
import { SemaphoreProofService } from "../SemaphoreProof";
import { getMerkleProof } from "../utils";

jest.mock("@cryptkeeperzk/rlnjs", (): unknown => ({
  RLNProver: jest.fn(() => ({
    generateProof: mockRlnGenerateProof, // Mock the generateProof function to resolve with emptyFullProof
  })),
}));

jest.mock("@cryptkeeperzk/semaphore-proof", (): unknown => ({
  generateProof: mockSemaphoreGenerateProof,
}));

jest.mock("../utils", (): unknown => ({
  getMerkleProof: jest.fn(),
  getMessageHash: jest.fn(),
}));

describe("background/services/protocols", () => {
  const defaultIdentity = new Identity("1234");

  const defaultIdentityMetadata: IdentityMetadata = {
    account: "account",
    name: "Identity #1",
    identityStrategy: "interrep",
    web2Provider: "twitter",
    groups: [],
    host: "http://localhost:3000",
  };

  const defaultMerkleProof: MerkleProof = {
    root: 0n,
    leaf: 1n,
    siblings: [],
    pathIndices: [],
  };

  const identityDecorater = new ZkIdentitySemaphore(defaultIdentity, defaultIdentityMetadata);

  beforeEach(() => {
    (getMerkleProof as jest.Mock).mockReturnValue(defaultMerkleProof);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rln", () => {
    const proofRequest: IRlnProofRequest = {
      identitySerialized: "identitySerialized",
      circuitFilePath: "circuitFilePath",
      verificationKey: "verificationKey",
      zkeyFilePath: "zkeyFilePath",
      rlnIdentifier: "1",
      message: "message",
      messageId: 1,
      messageLimit: 0,
      epoch: "1",
      merkleProofProvided: defaultMerkleProof,
    };

    test("should generate rln proof properly with remote merkle proof", async () => {
      const rln = new RLNProofService();
      mockRlnGenerateProof.mockResolvedValueOnce(emptyFullProof);

      await rln.genProof(identityDecorater, { ...proofRequest, merkleStorageAddress: "http://localhost:3000/merkle" });

      expect(mockRlnGenerateProof).toBeCalledTimes(1);
    });

    test("should generate rln proof properly with remote merkle proof but with string epoch", async () => {
      const rln = new RLNProofService();
      mockRlnGenerateProof.mockResolvedValueOnce(emptyFullProof);

      const proofRequestString: IRlnProofRequest = {
        identitySerialized: "identitySerialized",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
        rlnIdentifier: "1",
        message: "message",
        messageId: 1,
        messageLimit: 0,
        epoch: "1",
        merkleProofProvided: defaultMerkleProof,
      };

      await rln.genProof(identityDecorater, {
        ...proofRequestString,
        merkleStorageAddress: "http://localhost:3000/merkle",
      });

      expect(mockRlnGenerateProof).toBeCalledTimes(1);
    });

    test("should handle error properly when getting undefined zkey file paths", async () => {
      mockRlnGenerateProof.mockClear();
      (getMerkleProof as jest.Mock).mockClear();
      (getMerkleProof as jest.Mock).mockRejectedValue(new Error("error"));

      const rlnProofRequest: IRlnProofRequest = {
        identitySerialized: "identitySerialized",
        rlnIdentifier: "1",
        message: "message",
        messageId: 1,
        messageLimit: 0,
        epoch: "1",
      };

      const rln = new RLNProofService();

      const promise = rln.genProof(identityDecorater, {
        ...rlnProofRequest,
        merkleStorageAddress: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("Zk service: Must set circuitFilePath and zkeyFilePath");
    });

    test("should handle error properly when generating rln proof", async () => {
      mockRlnGenerateProof.mockClear();
      (getMerkleProof as jest.Mock).mockClear();
      (getMerkleProof as jest.Mock).mockRejectedValue(new Error("error"));

      const rlnProofRequest: IRlnProofRequest = {
        identitySerialized: "identitySerialized",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
        rlnIdentifier: "1",
        message: "message",
        messageId: 1,
        messageLimit: 0,
        epoch: "1",
      };

      const rln = new RLNProofService();

      const promise = rln.genProof(identityDecorater, {
        ...rlnProofRequest,
        merkleStorageAddress: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("error");
    });
  });

  describe("semaphore", () => {
    const proofRequest: ISemaphoreProofRequest = {
      identitySerialized: "identitySerialized",
      circuitFilePath: "circuitFilePath",
      verificationKey: "verificationKey",
      zkeyFilePath: "zkeyFilePath",
      externalNullifier: "externalNullifier",
      signal: "signal",
    };

    test("should generate semaphore proof properly with remote merkle proof", async () => {
      const semaphore = new SemaphoreProofService();

      await semaphore.genProof(identityDecorater, {
        ...proofRequest,
        merkleStorageAddress: "http://localhost:3000/merkle",
      });

      expect(mockSemaphoreGenerateProof).toBeCalledTimes(1);
      expect(mockSemaphoreGenerateProof).toBeCalledWith(
        identityDecorater.zkIdentity,
        defaultMerkleProof,
        proofRequest.externalNullifier,
        proofRequest.signal,
        { wasmFilePath: proofRequest.circuitFilePath, zkeyFilePath: proofRequest.zkeyFilePath },
      );
    });

    test("should handle error properly when getting undefined zkey file paths", async () => {
      const proofRequestWrong: ISemaphoreProofRequest = {
        identitySerialized: "identitySerialized",
        externalNullifier: "externalNullifier",
        signal: "signal",
      };
      const semaphore = new SemaphoreProofService();

      const promise = semaphore.genProof(identityDecorater, {
        ...proofRequestWrong,
        merkleStorageAddress: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("Zk service: Must set circuitFilePath and zkeyFilePath");
    });

    test("should handle error properly when generating semaphore proof", async () => {
      (getMerkleProof as jest.Mock).mockRejectedValue(new Error("error"));
      const semaphore = new SemaphoreProofService();

      const promise = semaphore.genProof(identityDecorater, {
        ...proofRequest,
        merkleStorageAddress: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("error");
    });
  });
});
