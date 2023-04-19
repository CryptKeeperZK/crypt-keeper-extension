import type { MerkleProofArtifacts } from "@src/types";

export enum ArtifactsProofValidatorErrors {
  INVALID_DEPTH = "invalid-depth",
  INVALID_LEAVES = "invalid-leaves",
  INVALID_LEAVES_PER_NODE = "invalid-leaves-per-node",
}

export class ArtifactsProofValidator {
  private proof: MerkleProofArtifacts;

  public constructor(proof: MerkleProofArtifacts) {
    this.proof = proof;
  }

  public validateProof = (): ArtifactsProofValidator => this.validateDepth().validateLeaves().validateLeavesPerNode();

  public validateDepth = (): ArtifactsProofValidator => {
    if (!this.proof.depth) {
      throw new Error(ArtifactsProofValidatorErrors.INVALID_DEPTH);
    }

    return this;
  };

  public validateLeaves = (): ArtifactsProofValidator => {
    if (!this.proof.leaves.length) {
      throw new Error(ArtifactsProofValidatorErrors.INVALID_LEAVES);
    }

    return this;
  };

  public validateLeavesPerNode = (): ArtifactsProofValidator => {
    if (!this.proof.leavesPerNode) {
      throw new Error(ArtifactsProofValidatorErrors.INVALID_LEAVES_PER_NODE);
    }

    return this;
  };
}
