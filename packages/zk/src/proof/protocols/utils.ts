import { Group, BigNumberish } from "@semaphore-protocol/group";
import { MerkleProof } from "@zk-kit/incremental-merkle-tree";
import { bigintToHex, hexToBigint } from "bigint-conversion";
// TODO: I think we should have a service for providing Cryptography pure related functions
// Maybe we need to rename CryptoService to another name, and having a CryptoService that only has these pure functions.
import { poseidon1, poseidon2 } from "poseidon-lite";

import type { MerkleProofArtifacts, VerificationKey } from "@cryptkeeperzk/types";

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
}

export async function getMerkleProof({
  identityCommitment,
  merkleStorageAddress,
  merkleProofArtifacts,
}: IGetMerkleProof): Promise<MerkleProof> {
  return merkleStorageAddress
    ? getRemoteMerkleProof(merkleStorageAddress, bigintToHex(identityCommitment))
    : generateMerkleProof({
        treeDepth: merkleProofArtifacts!.depth,
        member: identityCommitment,
        members: [identityCommitment],
      });
}

export async function getRlnVerificationKeyJson(rlnVerificationKeyPath: string): Promise<VerificationKey> {
  return fetch(rlnVerificationKeyPath).then((res) => res.json() as Promise<VerificationKey>);
}

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

export function str2BigInt(str: string): bigint {
  let num = "";
  for (let i = 0; i < str.length; i += 1) {
    num += str.charCodeAt(i).toString();
  }
  return BigInt(num);
}

export function getMessageHash(message: string): bigint {
  return poseidon1([str2BigInt(message)]);
}

export function getRateCommitmentHash(identityCommitment: bigint, userMessageLimit: number | bigint): bigint {
  return poseidon2([identityCommitment, userMessageLimit]);
}
