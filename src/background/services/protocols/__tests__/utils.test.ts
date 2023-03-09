import { Identity } from "@semaphore-protocol/identity";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";

import { deserializeMerkleProof, generateMerkleProof, getMerkleProof } from "../utils";

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

    expect(merkleProof.root.toString()).toBeDefined();
    expect(merkleProof.leaf.toString()).toBeDefined();
    expect(merkleProof.pathIndices).not.toHaveLength(0);
    expect(merkleProof.siblings).not.toHaveLength(0);
  });

  test("should get provided merkler proof properly", async () => {
    const identity = new Identity();

    const result = await getMerkleProof({
      identityCommitment: identity.getCommitment(),
      providerMerkleProof: defaultMerkleProof,
      merkleStorageAddress: "https://localhost:3000/merkle",
    });

    expect(result).toStrictEqual(defaultMerkleProof);
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
});
