import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { generateProof } from "@cryptkeeperzk/semaphore-proof";
import { IIdentityMetadata, IRLNProofRequest, ISemaphoreProofRequest } from "@cryptkeeperzk/types";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";

import { ZkIdentitySemaphore } from "@src/identity";

import type { RLNFullProof, Proof, RLNPublicSignals } from "@cryptkeeperzk/rlnjs";

import { RLNProofService, SemaphoreProofService } from "..";
import { getMerkleProof } from "../utils";

export const mockEmptyFullProof: RLNFullProof = {
  snarkProof: {
    proof: {} as Proof,
    publicSignals: {} as RLNPublicSignals,
  },
  epoch: BigInt("0"),
  rlnIdentifier: BigInt("1"),
};

const mockRlnGenerateProof = jest.fn(() => Promise.resolve(mockEmptyFullProof));

jest.mock("@cryptkeeperzk/rlnjs", (): unknown => ({
  RLNProver: jest.fn(() => ({
    generateProof: mockRlnGenerateProof,
  })),
}));

jest.mock("@cryptkeeperzk/semaphore-proof", (): unknown => ({
  generateProof: jest.fn(),
}));

jest.mock("../utils", (): unknown => ({
  getMerkleProof: jest.fn(),
  getMessageHash: jest.fn(),
}));

describe("background/services/protocols", () => {
  const defaultIdentity = new Identity("1234");

  const defaultIdentityMetadata: IIdentityMetadata = {
    account: "account",
    name: "Identity #1",
    groups: [],
    host: "http://localhost:3000",
    isDeterministic: true,
  };

  const defaultMerkleProof: MerkleProof = {
    root: 0n,
    leaf: 1n,
    siblings: [],
    pathIndices: [],
  };

  const identityDecorator = new ZkIdentitySemaphore(defaultIdentity, defaultIdentityMetadata);

  beforeEach(() => {
    (getMerkleProof as jest.Mock).mockReturnValue(defaultMerkleProof);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("rln", () => {
    const proofRequest: IRLNProofRequest = {
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
      mockRlnGenerateProof.mockResolvedValue(mockEmptyFullProof);

      await rln.genProof(identityDecorator, { ...proofRequest, merkleStorageUrl: "http://localhost:3000/merkle" });

      expect(mockRlnGenerateProof).toBeCalledTimes(1);
    });

    test("should generate rln proof properly with remote merkle proof but with string epoch", async () => {
      const rln = new RLNProofService();
      mockRlnGenerateProof.mockResolvedValue(mockEmptyFullProof);

      const proofRequestString: IRLNProofRequest = {
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

      await rln.genProof(identityDecorator, {
        ...proofRequestString,
        merkleStorageUrl: "http://localhost:3000/merkle",
      });

      expect(mockRlnGenerateProof).toBeCalledTimes(1);
    });

    test("should handle error properly when getting undefined zkey file paths", async () => {
      mockRlnGenerateProof.mockClear();
      (getMerkleProof as jest.Mock).mockClear();
      (getMerkleProof as jest.Mock).mockRejectedValue(new Error("error"));

      const rlnProofRequest: IRLNProofRequest = {
        identitySerialized: "identitySerialized",
        rlnIdentifier: "1",
        message: "message",
        messageId: 1,
        messageLimit: 0,
        epoch: "1",
      };

      const rln = new RLNProofService();

      const promise = rln.genProof(identityDecorator, {
        ...rlnProofRequest,
        merkleStorageUrl: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("Zk service: Must set circuitFilePath and zkeyFilePath");
    });

    test("should handle error properly when generating rln proof", async () => {
      mockRlnGenerateProof.mockClear();
      (getMerkleProof as jest.Mock).mockClear();
      (getMerkleProof as jest.Mock).mockRejectedValue(new Error("error"));

      const rlnProofRequest: IRLNProofRequest = {
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

      const promise = rln.genProof(identityDecorator, {
        ...rlnProofRequest,
        merkleStorageUrl: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("error");
    });

    test("should throw error if there is no merkle proof", async () => {
      (getMerkleProof as jest.Mock).mockResolvedValue(undefined);

      const rlnProofRequest: IRLNProofRequest = {
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

      const promise = rln.genProof(identityDecorator, {
        ...rlnProofRequest,
        merkleStorageUrl: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("No merkle proof error");
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

      await semaphore.genProof(identityDecorator, {
        ...proofRequest,
        merkleStorageUrl: "http://localhost:3000/merkle",
      });

      expect(generateProof).toBeCalledTimes(1);
      expect(generateProof).toBeCalledWith(
        identityDecorator.zkIdentity,
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

      const promise = semaphore.genProof(identityDecorator, {
        ...proofRequestWrong,
        merkleStorageUrl: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("Zk service: Must set circuitFilePath and zkeyFilePath");
    });

    test("should handle error properly when generating semaphore proof", async () => {
      (getMerkleProof as jest.Mock).mockRejectedValue(new Error("error"));
      const semaphore = new SemaphoreProofService();

      const promise = semaphore.genProof(identityDecorator, {
        ...proofRequest,
        merkleStorageUrl: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("error");
    });

    test("should throw error if there is no merkle proof", async () => {
      (getMerkleProof as jest.Mock).mockResolvedValue(undefined);

      const semaphore = new SemaphoreProofService();

      const promise = semaphore.genProof(identityDecorator, {
        ...proofRequest,
        merkleStorageUrl: "http://localhost:3000/merkle",
      });

      await expect(promise).rejects.toThrowError("No merkle proof error");
    });
  });
});
