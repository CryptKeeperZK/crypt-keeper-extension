import type { IMerkleProofArtifacts } from "@cryptkeeperzk/types";

export enum ArtifactsProofValidatorErrors {
  INVALID_DEPTH = "invalid-depth",
  INVALID_LEAVES = "invalid-leaves",
  INVALID_LEAVES_PER_NODE = "invalid-leaves-per-node",
}

export class ArtifactsProofValidator {
  private proof: IMerkleProofArtifacts;

  constructor(proof: IMerkleProofArtifacts) {
    this.proof = proof;
  }

  validateProof = (): this => this.validateDepth().validateLeaves().validateLeavesPerNode();

  validateDepth = (): this => {
    if (!this.proof.depth) {
      throw new Error(ArtifactsProofValidatorErrors.INVALID_DEPTH);
    }

    return this;
  };

  validateLeaves = (): this => {
    if (!this.proof.leaves.length) {
      throw new Error(ArtifactsProofValidatorErrors.INVALID_LEAVES);
    }

    return this;
  };

  validateLeavesPerNode = (): this => {
    if (!this.proof.leavesPerNode) {
      throw new Error(ArtifactsProofValidatorErrors.INVALID_LEAVES_PER_NODE);
    }

    return this;
  };
}
