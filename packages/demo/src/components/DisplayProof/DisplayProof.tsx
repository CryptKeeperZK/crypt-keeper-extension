import { ISemaphoreFullProof, IRLNFullProof, IMerkleProof } from "@cryptkeeperzk/types";

interface IDisplayProofProps {
  proof?: ISemaphoreFullProof | IRLNFullProof | IMerkleProof;
}

export const DisplayProof = ({ proof = undefined }: IDisplayProofProps): JSX.Element => (
  <div>
    <h2>Generated proof output:</h2>

    <div>
      <pre data-testid="proof-json">{JSON.stringify(proof, null, 2)}</pre>
    </div>
  </div>
);
