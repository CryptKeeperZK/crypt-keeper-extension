import { MerkleProofType } from "@src/types";

interface ISemaphoreProps {
  genSemaphoreProof: (proofType: MerkleProofType) => void;
}

export const Semaphore = ({ genSemaphoreProof }: ISemaphoreProps): JSX.Element => (
  <div>
    <h2>Semaphore</h2>

    <button
      type="button"
      onClick={() => {
        genSemaphoreProof(MerkleProofType.STORAGE_ADDRESS);
      }}
    >
      Generate proof from Merkle proof storage address
    </button>

    <br />

    <br />

    <button
      type="button"
      onClick={() => {
        genSemaphoreProof(MerkleProofType.ARTIFACTS);
      }}
    >
      Generate proof from Merkle proof artifacts
    </button>
  </div>
);
