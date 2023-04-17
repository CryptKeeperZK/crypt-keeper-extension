import { MerkleProofValidator, MerkleProofValidatorErrors } from "@src/background/services/validator/MerkleValidator";

describe("background/services/validation/merkle", () => {
  test("should validate proof properly", () => {
    const validator = new MerkleProofValidator({ root: 1n, leaf: 1n, siblings: [1n], pathIndices: [1] });

    expect(() => validator.validateProof()).not.toThrowError();
  });

  test("should throw error if the is zero root", () => {
    const validator = new MerkleProofValidator({ root: 0n, leaf: 1n, siblings: [1n], pathIndices: [1] });

    expect(() => validator.validateProof()).toThrowError(MerkleProofValidatorErrors.INVALID_ROOT);
    expect(() => validator.validateRoot()).toThrowError(MerkleProofValidatorErrors.INVALID_ROOT);
  });

  test("should throw error if the is zero leaf", () => {
    const validator = new MerkleProofValidator({ root: 1n, leaf: 0n, siblings: [1n], pathIndices: [1] });

    expect(() => validator.validateProof()).toThrowError(MerkleProofValidatorErrors.INVALID_LEAF);
    expect(() => validator.validateLeaf()).toThrowError(MerkleProofValidatorErrors.INVALID_LEAF);
  });

  test("should throw error if the is an empty siblings array", () => {
    const validator = new MerkleProofValidator({ root: 1n, leaf: 1n, siblings: [], pathIndices: [1] });

    expect(() => validator.validateProof()).toThrowError(MerkleProofValidatorErrors.INVALID_SIBLINGS);
    expect(() => validator.validateSiblings()).toThrowError(MerkleProofValidatorErrors.INVALID_SIBLINGS);
  });

  test("should throw error if the is an empty path indicies array", () => {
    const validator = new MerkleProofValidator({ root: 1n, leaf: 1n, siblings: [1n], pathIndices: [] });

    expect(() => validator.validateProof()).toThrowError(MerkleProofValidatorErrors.INVALID_PATH_INDICIES);
    expect(() => validator.validatePathIndicies()).toThrowError(MerkleProofValidatorErrors.INVALID_PATH_INDICIES);
  });
});
