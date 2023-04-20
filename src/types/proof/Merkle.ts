export type { MerkleProof } from "@zk-kit/incremental-merkle-tree";

export type MerkleProofArtifacts = {
  leaves: string[];
  depth: number;
  leavesPerNode: number;
};
