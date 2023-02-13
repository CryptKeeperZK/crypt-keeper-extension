import { hexToBigint } from "bigint-conversion";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { Group, Member } from "@semaphore-protocol/group";

export function deserializeMerkleProof(merkleProof: MerkleProof): MerkleProof {
  const deserialized = {} as MerkleProof;
  deserialized.root = hexToBigint(merkleProof.root);
  deserialized.siblings = merkleProof.siblings.map(siblings =>
    Array.isArray(siblings) ? siblings.map(element => hexToBigint(element)) : hexToBigint(siblings),
  );
  deserialized.pathIndices = merkleProof.pathIndices;
  deserialized.leaf = hexToBigint(merkleProof.leaf);
  return deserialized;
}

//export const poseidonHash = (data: Array<bigint>): bigint => poseidon(data)

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

  const identityIndex = group.indexOf(member);

  return group.generateMerkleProof(identityIndex);
}
