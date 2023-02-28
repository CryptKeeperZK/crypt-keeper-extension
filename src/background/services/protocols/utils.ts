import { bigintToHex, hexToBigint } from "bigint-conversion";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { Group, Member } from "@semaphore-protocol/group";

import { MerkleProofArtifacts } from "@src/types";

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

export interface IGetMerkleProof {
  identityCommitment: bigint;
  merkleStorageAddress?: string;
  merkleProofArtifacts?: MerkleProofArtifacts;
  providerMerkleProof?: MerkleProof;
}

export async function getMerkleProof({
  identityCommitment,
  merkleStorageAddress,
  merkleProofArtifacts,
  providerMerkleProof,
}: IGetMerkleProof): Promise<MerkleProof> {
  if (providerMerkleProof) {
    return providerMerkleProof;
  }

  return merkleStorageAddress
    ? await getRemoteMerkleProof(merkleStorageAddress, bigintToHex(identityCommitment))
    : generateMerkleProof({
        treeDepth: (merkleProofArtifacts as MerkleProofArtifacts).depth,
        member: identityCommitment,
        members: [identityCommitment],
      });
}

function getRemoteMerkleProof(merkleStorageAddress: string, identityCommitmentHex: string): Promise<MerkleProof> {
  return fetch(merkleStorageAddress, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identityCommitment: identityCommitmentHex,
    }),
  })
    .then(res => res.json())
    .then(response => deserializeMerkleProof(response.data.merkleProof));
}
