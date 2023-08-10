import { Identity } from "@semaphore-protocol/identity";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { poseidon1, poseidon2 } from "poseidon-lite";

import {
  deserializeMerkleProof,
  generateMerkleProof,
  getMerkleProof,
  getMessageHash,
  getRateCommitmentHash,
  getRlnVerificationKeyJson,
  str2BigInt,
} from "../utils";

describe("background/services/protocols/utils", () => {
  const defaultMerkleProof: MerkleProof = {
    root: 0n,
    leaf: 1n,
    siblings: [[0n, 1n, 2n], 3n, 4n],
    pathIndices: [0, 1, 2, 3],
  };

  const defaultDeserializedMerkleProof = {
    root: "0",
    leaf: "1",
    siblings: [["0", "1", "2"], "3", "4"],
    pathIndices: [0, 1, 2, 3],
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should deserialize merkle proof properly", () => {
    const deserialized = deserializeMerkleProof(defaultDeserializedMerkleProof);

    expect(deserialized).toStrictEqual(defaultMerkleProof);
  });

  test("should generate merkle proof properly", () => {
    const identity = new Identity();
    const merkleProof = generateMerkleProof({
      treeDepth: 2,
      member: identity.getCommitment(),
      members: [identity.getCommitment()],
    });

    expect(merkleProof.root).toBeDefined();
    expect(merkleProof.leaf).toBeDefined();
    expect(merkleProof.pathIndices).not.toHaveLength(0);
    expect(merkleProof.siblings).not.toHaveLength(0);
  });

  test("should get merkle proof from remote host properly", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ data: { merkleProof: defaultDeserializedMerkleProof } }),
    } as Response);

    const identity = new Identity();

    const result = await getMerkleProof({
      identityCommitment: identity.getCommitment(),
      merkleStorageAddress: "http://localhost:3000/merkle",
    });

    expect(fetchSpy).toBeCalledTimes(1);
    expect(result).toStrictEqual(defaultMerkleProof);
  });

  test("should get merkle proof from artifact properly", async () => {
    const identity = new Identity();

    const result = await getMerkleProof({
      identityCommitment: identity.getCommitment(),
      merkleProofArtifacts: { depth: 20, leavesPerNode: 1, leaves: [] },
    });

    expect(result).toBeDefined();
  });

  test("should get merkle proof from remote host properly", async () => {
    const fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({
      json: () => Promise.resolve({ data: {} }),
    } as Response);

    const result = await getRlnVerificationKeyJson("path");

    expect(fetchSpy).toBeCalledTimes(1);
    expect(result).toStrictEqual({ data: {} });
  });

  test("should be able to convert string to bigint", () => {
    const string = "1234";
    const bigint = str2BigInt(string);

    expect(bigint).toBeDefined();
    expect(typeof bigint).toStrictEqual("bigint");
  });

  test("should be able to hash a string using Poseidon1 hash function", () => {
    const message = "1234";
    const bigintMessage = str2BigInt(message);
    const expectedMessageHash = poseidon1([bigintMessage]);
    const actualMessageHash = getMessageHash(message);

    expect(actualMessageHash).toBeDefined();
    expect(typeof actualMessageHash).toStrictEqual("bigint");
    expect(expectedMessageHash).toStrictEqual(actualMessageHash);
  });

  test("should be able to calculate the rate commitment of hash", () => {
    const identityCommitment = 1n;
    const userMessageLimit = 1;
    const expectedCommitmentHash = poseidon2([identityCommitment, userMessageLimit]);
    const actualCommitmentHash = getRateCommitmentHash(identityCommitment, userMessageLimit);

    expect(actualCommitmentHash).toBeDefined();
    expect(typeof actualCommitmentHash).toStrictEqual("bigint");
    expect(expectedCommitmentHash).toStrictEqual(actualCommitmentHash);
  });
});
