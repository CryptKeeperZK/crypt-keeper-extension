import { hexToBigint } from "bigint-conversion";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { Group, Member } from "@semaphore-protocol/group";

export function deserializeMerkleProof(merkleProof: MerkleProof): MerkleProof {
  return {
    root: hexToBigint(merkleProof.root),
    siblings: merkleProof.siblings.map(siblings =>
      Array.isArray(siblings) ? siblings.map(element => hexToBigint(element)) : hexToBigint(siblings),
    ),
    pathIndices: merkleProof.pathIndices,
    leaf: hexToBigint(merkleProof.leaf),
  };
}

export interface IGenerateMerkelProofArgs {
  treeDepth: number;
  member: Member;
  members?: Member[];
}

export function generateMerkleProof({ treeDepth, member, members }: IGenerateMerkelProofArgs): MerkleProof {
  const group = new Group(treeDepth);

  if (members) {
    group.addMembers(members);
  }

  return group.generateMerkleProof(group.indexOf(member));
}
