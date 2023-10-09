import { IMerkleProof, IMerkleProofArtifacts, IMerkleProofInputs, MerkleProofStorageUrl } from "@cryptkeeperzk/types";
import { string, array, number, object, type Schema } from "yup";

import { MerkleProofValidator } from "./merkle";

const merkleProofStorageUrlSchema: Schema<MerkleProofStorageUrl> = string().url().required();

const merkleProofArtifactsSchema: Schema<IMerkleProofArtifacts> = object({
  leaves: array().of(string().required()).required(),
  depth: number().required(),
  leavesPerNode: number().required(),
});

const merkleProofSchema: Schema<IMerkleProof> = object({
  root: string().required(),
  leaf: string().required(),
  siblings: array().of(string().required()).required(),
  pathIndices: array().of(number().required()).required(),
});

export const validateMerkleProofSource = ({
  merkleProofSource,
}: Partial<IMerkleProofInputs>): Partial<IMerkleProofInputs> => {
  if (!merkleProofSource) {
    throw new Error("CryptKeeper: please set a merkle proof source.");
  }

  if (typeof merkleProofSource === "string" && merkleProofStorageUrlSchema.isValidSync(merkleProofSource)) {
    const merkleStorageUrl: MerkleProofStorageUrl = merkleProofSource;
    return { merkleStorageUrl };
  }

  if (typeof merkleProofSource === "object" && merkleProofArtifactsSchema.isValidSync(merkleProofSource)) {
    const merkleProofArtifacts: IMerkleProofArtifacts = merkleProofSource;
    return { merkleProofArtifacts };
  }

  if (typeof merkleProofSource === "object" && merkleProofSchema.isValidSync(merkleProofSource)) {
    const merkleProofProvided: IMerkleProof = merkleProofSource;
    new MerkleProofValidator(merkleProofProvided).validateProof();
    return { merkleProofProvided };
  }

  throw new Error("CryptKeeper: invalid ZK merkle tree inputs");
};
