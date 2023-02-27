import { Identity } from "@semaphore-protocol/identity";
import { deserializeMerkleProof, generateMerkleProof } from "../utils";

describe("background/services/protocols/utils", () => {
  test("should deserialize merkle proof properly", () => {
    const deserialized = deserializeMerkleProof({
      root: "0",
      leaf: "1",
      siblings: [["0", "1", "2"], "3", "4"],
      pathIndices: [0, 1, 2, 3],
    });

    expect(deserialized).toStrictEqual({
      root: 0n,
      leaf: 1n,
      siblings: [[0n, 1n, 2n], 3n, 4n],
      pathIndices: [0, 1, 2, 3],
    });
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
});
