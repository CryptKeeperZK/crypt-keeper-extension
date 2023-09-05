import { Group, BigNumberish } from "@cryptkeeperzk/semaphore-group";
import { bigintToHex, hexToBigint } from "bigint-conversion";
// TODO: I think we should have a service for providing Cryptography pure related functions
// Maybe we need to rename CryptoService to another name, and having a CryptoService that only has these pure functions.
import { poseidon1 } from "poseidon-lite/poseidon1";
import { poseidon2 } from "poseidon-lite/poseidon2";

import type { IMerkleProofArtifacts, IMerkleProof, IRLNVerificationKey } from "@cryptkeeperzk/types";

export interface IGenerateMerkleProofArgs {
  treeDepth: number;
  member: BigNumberish;
  members?: BigNumberish[];
}

export interface IGetMerkleProof {
  identityCommitment: bigint;
  merkleStorageAddress?: string;
  merkleProofArtifacts?: IMerkleProofArtifacts;
}

async function getRemoteMerkleProof(
  merkleStorageAddress: string,
  identityCommitmentHex: string,
): Promise<IMerkleProof> {
  return fetch(merkleStorageAddress, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identityCommitment: identityCommitmentHex,
    }),
  })
    .then((res) => res.json())
    .then((response: { data: { merkleProof: IMerkleProof } }) => deserializeMerkleProof(response.data.merkleProof));
}

export function deserializeMerkleProof(merkleProof: IMerkleProof): IMerkleProof {
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

export function generateMerkleProof({ treeDepth, member, members }: IGenerateMerkleProofArgs): IMerkleProof {
  const group = new Group(treeDepth);

  if (members) {
    group.addMembers(members);
  }

  return group.generateMerkleProof(group.indexOf(member));
}

export async function getMerkleProof({
  identityCommitment,
  merkleStorageAddress,
  merkleProofArtifacts,
}: IGetMerkleProof): Promise<IMerkleProof | undefined> {
  if (merkleStorageAddress) {
    return getRemoteMerkleProof(merkleStorageAddress, bigintToHex(identityCommitment));
  }

  if (merkleProofArtifacts) {
    return generateMerkleProof({
      treeDepth: merkleProofArtifacts.depth,
      member: identityCommitment,
      members: [identityCommitment],
    });
  }

  throw new Error("ZK: Cannot get MerkleProof");
}

export async function getRlnVerificationKeyJson(rlnVerificationKeyPath: string): Promise<IRLNVerificationKey> {
  return fetch(rlnVerificationKeyPath).then((res) => res.json() as Promise<IRLNVerificationKey>);
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
