import { ZkInputs } from "@cryptkeeperzk/types";

import { validateZkInputs } from "..";

describe("background/services/zkValidator", () => {
  test("should validate proof properly", () => {
    const args = {
      merkleProofArtifactsOrStorageAddress: "merkleStorageAddress",
      merkleStorageAddress: "merkleStorageAddress",
      merkleProofArtifacts: { depth: 1, leaves: ["leaf-1"], leavesPerNode: 1 },
      merkleProofProvided: { root: 1n, leaf: 1n, siblings: [1n], pathIndices: [1] },
    };

    const result = validateZkInputs(args);

    expect(result).toStrictEqual(args);
  });

  test("should validate artifacts properly", () => {
    const args = {
      merkleProofArtifacts: { depth: 1, leaves: ["leaf-1"], leavesPerNode: 1 },
    } as Required<ZkInputs>;

    const result = validateZkInputs(args);

    expect(result).toStrictEqual(args);
  });

  test("should validate proof properly with storage address", () => {
    const args = {
      merkleStorageAddress: "merkleStorageAddress",
    } as Required<ZkInputs>;

    const result = validateZkInputs(args);

    expect(result).toStrictEqual(args);
  });

  test("should throw error if there is no any input", () => {
    expect(() => validateZkInputs({} as Required<ZkInputs>)).toThrowError("no proof provided");
  });
});
