import { IMerkleProofInputs } from "@cryptkeeperzk/types";

import { validateMerkleProofSource } from "..";

describe("background/services/validation", () => {
  test("should validate merkle proof storage URL properly", () => {
    const mockMerkleSource = {
      merkleProofSource: "merkleStorageUrl",
    };

    const expectedOutput = {
      merkleStorageUrl: "merkleStorageUrl",
    };

    const result = validateMerkleProofSource(mockMerkleSource);

    expect(result).toStrictEqual(expectedOutput);
  });

  test("should validate merkle proof artifacts properly", () => {
    const mockMerkleSource = {
      merkleProofSource: { depth: 1, leaves: ["leaf-1"], leavesPerNode: 1 },
    } as Required<IMerkleProofInputs>;

    const expectedOutput = {
      merkleProofArtifacts: { depth: 1, leaves: ["leaf-1"], leavesPerNode: 1 },
    };

    const result = validateMerkleProofSource(mockMerkleSource);

    expect(result).toStrictEqual(expectedOutput);
  });

  test("should validate a given provided merkle proof properly", () => {
    const mockMerkleSource = {
      merkleProofSource: { root: 1n, leaf: 1n, siblings: [1n], pathIndices: [1] },
    } as Required<IMerkleProofInputs>;

    const expectedOutput = {
      merkleProofProvided: { root: 1n, leaf: 1n, siblings: [1n], pathIndices: [1] },
    };

    const result = validateMerkleProofSource(mockMerkleSource);

    expect(result).toStrictEqual(expectedOutput);
  });

  test("should throw error if there is no any input", () => {
    expect(() => validateMerkleProofSource({} as Required<IMerkleProofInputs>)).toThrowError(
      "CryptKeeper: please set a merkle proof source.",
    );
  });
});
