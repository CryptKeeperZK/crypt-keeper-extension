interface IGetCommitmentProps {
  revealConnectedIdentityCommitment: () => Promise<void>;
}

export const GetCommitment = ({ revealConnectedIdentityCommitment }: IGetCommitmentProps): JSX.Element => (
  <div>
    <h2>Reveal connected identity Commitment</h2>

    <button
      data-testid="reveal-connected-identity-commitment"
      type="button"
      onClick={revealConnectedIdentityCommitment}
    >
      Reveal
    </button>
  </div>
);
