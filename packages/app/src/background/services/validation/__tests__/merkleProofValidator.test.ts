import { MerkleProofValidator, MerkleProofValidatorErrors } from "../merkle";

describe("background/services/validation/merkle", () => {
  test("should validate proof properly", () => {
    const validator = new MerkleProofValidator({ root: 1n, leaf: 1n, siblings: [1n], pathIndices: [1] });

    expect(() => validator.validateProof()).not.toThrow();
  });

  test("should throw error if the is zero root", () => {
    const validator = new MerkleProofValidator({ root: 0n, leaf: 1n, siblings: [1n], pathIndices: [1] });

    expect(() => validator.validateProof()).toThrow(MerkleProofValidatorErrors.INVALID_ROOT);
    expect(() => validator.validateRoot()).toThrow(MerkleProofValidatorErrors.INVALID_ROOT);
  });

  test("should throw error if the is zero leaf", () => {
    const validator = new MerkleProofValidator({ root: 1n, leaf: 0n, siblings: [1n], pathIndices: [1] });

    expect(() => validator.validateProof()).toThrow(MerkleProofValidatorErrors.INVALID_LEAF);
    expect(() => validator.validateLeaf()).toThrow(MerkleProofValidatorErrors.INVALID_LEAF);
  });

  test("should throw error if the is an empty siblings array", () => {
    const validator = new MerkleProofValidator({ root: 1n, leaf: 1n, siblings: [], pathIndices: [1] });

    expect(() => validator.validateProof()).toThrow(MerkleProofValidatorErrors.INVALID_SIBLINGS);
    expect(() => validator.validateSiblings()).toThrow(MerkleProofValidatorErrors.INVALID_SIBLINGS);
  });

  test("should throw error if the is an empty path indicies array", () => {
    const validator = new MerkleProofValidator({ root: 1n, leaf: 1n, siblings: [1n], pathIndices: [] });

    expect(() => validator.validateProof()).toThrow(MerkleProofValidatorErrors.INVALID_PATH_INDICES);
    expect(() => validator.validatePathIndices()).toThrow(MerkleProofValidatorErrors.INVALID_PATH_INDICES);
  });
});
