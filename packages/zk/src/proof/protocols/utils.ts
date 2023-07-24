import { Group, BigNumberish } from "@semaphore-protocol/group";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { bigintToHex, hexToBigint } from "bigint-conversion";

import type { MerkleProofArtifacts } from "@cryptkeeperzk/types";

export function deserializeMerkleProof(merkleProof: MerkleProof): MerkleProof {
  return {
    root: hexToBigint(merkleProof.root as string),
    siblings: merkleProof.siblings.map((siblings) =>
      Array.isArray(siblings)
        ? siblings.map((element) => hexToBigint(element as string))
        : hexToBigint(siblings as string),
    ),
    pathIndices: merkleProof.pathIndices,
    leaf: hexToBigint(merkleProof.leaf as string),
  };
}

export interface IGenerateMerkelProofArgs {
  treeDepth: number;
  member: BigNumberish;
  members?: BigNumberish[];
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
    ? getRemoteMerkleProof(merkleStorageAddress, bigintToHex(identityCommitment))
    : generateMerkleProof({
        treeDepth: merkleProofArtifacts!.depth,
        member: identityCommitment,
        members: [identityCommitment],
      });
}

// export async function getRlnVerficationKeyJson(rlnVerificationKeyPath: string): Promise<VerificationKey> {
//   return fetch(rlnVerificationKeyPath).then((res) => res.json() as Promise<VerificationKey>);
// }

async function getRemoteMerkleProof(merkleStorageAddress: string, identityCommitmentHex: string): Promise<MerkleProof> {
  return fetch(merkleStorageAddress, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identityCommitment: identityCommitmentHex,
    }),
  })
    .then((res) => res.json())
    .then((response: { data: { merkleProof: MerkleProof } }) => deserializeMerkleProof(response.data.merkleProof));
}
