import { ZkInputs } from "@src/types";

import { MerkleProofValidator, ArtifactsProofValidator } from "./validation";

export const validateZkInputs = (payload: Required<ZkInputs>): Required<ZkInputs> => {
  const { merkleProofArtifacts, merkleProof } = payload;

  if (merkleProof) {
    new MerkleProofValidator(merkleProof).validateProof();
  } else if (merkleProofArtifacts) {
    new ArtifactsProofValidator(merkleProofArtifacts).validateProof();
  } else {
    throw new Error("no proof provided");
  }

  return payload;
};
