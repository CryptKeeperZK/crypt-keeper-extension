export type { MerkleProof as IMerkleProof } from "@zk-kit/incremental-merkle-tree";

export interface IMerkleProofArtifacts {
  leaves: string[];
  depth: number;
  leavesPerNode: number;
}
