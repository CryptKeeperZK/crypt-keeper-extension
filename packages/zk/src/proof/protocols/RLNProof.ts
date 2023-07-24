// TODO: RLN fix
// import { RLN, RLNFullProof } from "rlnjs";

// import { ZkIdentitySemaphore } from "@src/identity";

// import type { RLNProofRequest } from "@cryptkeeperzk/types";

// import { IZkProof } from "./types";
// import { getMerkleProof, getRlnVerficationKeyJson } from "./utils";

// export class RLNProofService implements IZkProof<RLNProofRequest, RLNFullProof> {
//   async genProof(
//     identity: ZkIdentitySemaphore,
//     {
//       circuitFilePath,
//       zkeyFilePath,
//       verificationKey,
//       merkleStorageAddress,
//       externalNullifier,
//       signal,
//       merkleProofArtifacts,
//       merkleProof: providerMerkleProof,
//     }: RLNProofRequest,
//   ): Promise<RLNFullProof> {
//     const rlnVerificationKeyJson = await getRlnVerficationKeyJson(verificationKey);

//     const rln = new RLN(circuitFilePath, zkeyFilePath, rlnVerificationKeyJson);

//     const identityCommitment = identity.genIdentityCommitment();

//     const merkleProof = await getMerkleProof({
//       identityCommitment,
//       merkleProofArtifacts,
//       merkleStorageAddress,
//       providerMerkleProof,
//     });

//     return rln.generateProof(signal, merkleProof, externalNullifier);
//   }
// }
