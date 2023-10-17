import { MerkleProofType } from "@src/types";

interface IRateLimitingNullifierProps {
  genRLNProof: (proofType: MerkleProofType) => void;
}

export const RateLimitingNullifier = ({ genRLNProof }: IRateLimitingNullifierProps): JSX.Element => (
  <div>
    <h2>Rate-Limiting Nullifier</h2>

    <div>
      <button
        type="button"
        onClick={() => {
          genRLNProof(MerkleProofType.STORAGE_ADDRESS);
        }}
      >
        Generate proof from Merkle proof storage address
      </button>

      <br />

      <br />

      <button
        type="button"
        onClick={() => {
          genRLNProof(MerkleProofType.ARTIFACTS);
        }}
      >
        Generate proof from Merkle proof artifacts
      </button>
    </div>
  </div>
);
