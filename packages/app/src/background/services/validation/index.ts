import { IZkInputs } from "@cryptkeeperzk/types";

import { ArtifactsProofValidator } from "./artifact";
import { MerkleProofValidator } from "./merkle";

export const validateZkInputs = (payload: Partial<IZkInputs>): Partial<IZkInputs> => {
  const { merkleProofArtifacts, merkleProofProvided, merkleStorageAddress } = payload;

  if (merkleProofProvided) {
    new MerkleProofValidator(merkleProofProvided).validateProof();
  } else if (merkleProofArtifacts) {
    new ArtifactsProofValidator(merkleProofArtifacts).validateProof();
  } else if (merkleStorageAddress) {
    return payload;
  } else {
    throw new Error("no proof provided");
  }

  return payload;
};
