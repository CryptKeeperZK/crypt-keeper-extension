import { Group, BigNumberish } from "@semaphore-protocol/group";
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
  merkleStorageUrl?: string;
  merkleProofArtifacts?: IMerkleProofArtifacts;
}

async function getRemoteMerkleProof(merkleStorageUrl: string, identityCommitmentHex: string): Promise<IMerkleProof> {
  return fetch(merkleStorageUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identityCommitment: identityCommitmentHex,
    }),
  })
    .then((response) => response.json())
    .then((response: { data: { merkleProof: IMerkleProof } }) => deserializeMerkleProof(response.data.merkleProof))
    .catch((error: Error) => {
      throw new Error(`Error in fetching Mock Merkle Proof ${error.message}`);
    });
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
  merkleStorageUrl,
  merkleProofArtifacts,
}: IGetMerkleProof): Promise<IMerkleProof | undefined> {
  if (merkleStorageUrl) {
    return getRemoteMerkleProof(merkleStorageUrl, bigintToHex(identityCommitment));
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

interface IGetSecret {
  nullifier?: string;
  trapdoor?: string;
}

export function calculateIdentitySecret({ nullifier, trapdoor }: IGetSecret): string {
  return nullifier && trapdoor ? poseidon2([nullifier, trapdoor]).toString() : "";
}

export function calculateIdentityCommitment(secret?: string): string {
  return secret ? poseidon1([secret]).toString() : "";
}
