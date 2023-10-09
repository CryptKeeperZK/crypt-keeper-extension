import * as yup from "yup";

import type {
  IMerkleProof,
  IMerkleProofArtifacts,
  IMerkleProofInputs,
  MerkleProofStorageUrl,
} from "@cryptkeeperzk/types";

import { MerkleProofValidator } from "./merkle";

const URL_PATTERN = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;

const merkleProofStorageUrlSchema: yup.Schema<MerkleProofStorageUrl> = yup
  .string()
  .matches(URL_PATTERN, "Invalid URL format")
  .required();

const merkleProofArtifactsSchema: yup.Schema<IMerkleProofArtifacts> = yup.object({
  leaves: yup.array().of(yup.string().required()).required(),
  depth: yup.number().required(),
  leavesPerNode: yup.number().required(),
});

const merkleProofSchema: yup.Schema<IMerkleProof> = yup.object({
  root: yup.string().required(),
  leaf: yup.string().required(),
  siblings: yup.array().of(yup.string().required()).required(),
  pathIndices: yup.array().of(yup.number().required()).required(),
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
