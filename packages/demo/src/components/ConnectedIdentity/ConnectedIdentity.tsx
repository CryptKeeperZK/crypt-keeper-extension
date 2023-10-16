interface IConnectedIdentityProps {
  identityCommitment?: string;
  identityName?: string;
  identityHost?: string;
}

export const ConnectedIdentity = ({
  identityCommitment = "",
  identityName = "",
  identityHost = "",
}: IConnectedIdentityProps): JSX.Element => (
  <div>
    <h2>Connected identity:</h2>

    {identityCommitment && (
      <div>
        <strong>Commitment:</strong>

        <p data-testid="commitment">{identityCommitment}</p>
      </div>
    )}

    <div>
      <strong>Name:</strong>

      <p data-testid="connected-name">{identityName}</p>
    </div>

    <div>
      <strong>Host:</strong>

      <p data-testid="connected-urlOrigin">{identityHost}</p>
    </div>
  </div>
);
