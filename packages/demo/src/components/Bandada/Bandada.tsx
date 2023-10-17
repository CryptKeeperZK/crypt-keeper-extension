interface IBandadaProps {
  joinGroup: () => Promise<void>;
  generateGroupMerkleProof: () => Promise<void>;
}

export const Bandada = ({ joinGroup, generateGroupMerkleProof }: IBandadaProps): JSX.Element => (
  <div>
    <h2>Generate bandada group proof</h2>

    <div>
      <button type="button" onClick={generateGroupMerkleProof}>
        Generate Group Merkle Proof
      </button>
    </div>

    <br />

    <div>
      <button type="button" onClick={joinGroup}>
        Join test group
      </button>
    </div>
  </div>
);
