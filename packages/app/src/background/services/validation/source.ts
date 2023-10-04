import { MerkleProofSource, MerkleProofStorageUrl } from "@cryptkeeperzk/types/dist/src/proof/zkProof";

import type { IMerkleProof, IMerkleProofArtifacts, IMerkleProofInputs } from "@cryptkeeperzk/types";

import { MerkleProofValidator } from "./merkle";

export const validateMerkleProofSource = ({
  merkleProofSource,
}: Partial<IMerkleProofInputs>): Partial<IMerkleProofInputs> => {
  if (!merkleProofSource) {
    throw new Error("CryptKeeper: please set a merkle proof source.");
  }

  if (isMerkleProofStorageUrl(merkleProofSource)) {
    const merkleStorageUrl: MerkleProofStorageUrl = merkleProofSource as MerkleProofStorageUrl;
    return { merkleStorageUrl };
  }
  if (isMerkleProofArtifacts(merkleProofSource)) {
    const merkleProofArtifacts: IMerkleProofArtifacts = merkleProofSource as IMerkleProofArtifacts;
    return { merkleProofArtifacts };
  }
  if (isMerkleProof(merkleProofSource)) {
    const merkleProofProvided: IMerkleProof = merkleProofSource as IMerkleProof;
    new MerkleProofValidator(merkleProofProvided).validateProof();
    return { merkleProofProvided };
  }
  throw new Error("CryptKeeper: invalid ZK merkle tree inputs");
};

function isMerkleProofStorageUrl(merkleProofSource: MerkleProofSource): boolean {
  return typeof merkleProofSource === "string";
}

function isMerkleProofArtifacts(merkleProofSource: MerkleProofSource): boolean {
  return (
    typeof merkleProofSource !== "string" &&
    typeof merkleProofSource === "object" &&
    "leaves" in merkleProofSource &&
    "depth" in merkleProofSource &&
    "leavesPerNode" in merkleProofSource
  );
}

function isMerkleProof(proof: MerkleProofSource): boolean {
  return (
    typeof proof === "object" && "root" in proof && "leaf" in proof && "siblings" in proof && "pathIndices" in proof
  );
}
