export type { MerkleProof } from "@zk-kit/incremental-merkle-tree";

export interface MerkleProofArtifacts {
  leaves: string[];
  depth: number;
  leavesPerNode: number;
}
