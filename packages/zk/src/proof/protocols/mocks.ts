import type { Proof, RLNFullProof, RLNPublicSignals } from "@cryptkeeperzk/rlnjs";

export const mockRlnGenerateProof = jest.fn();
export const mockSemaphoreGenerateProof = jest.fn();
export const mockGetMerkleProof = jest.fn();
export const emptyFullProof: RLNFullProof = {
  snarkProof: {
    proof: {} as Proof,
    publicSignals: {} as RLNPublicSignals,
  },
  epoch: BigInt("0"),
  rlnIdentifier: BigInt("1"),
};
