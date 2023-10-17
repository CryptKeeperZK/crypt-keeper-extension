interface IGetMetadataProps {
  getConnectedIdentityMetadata: () => void;
}

export const GetMetadata = ({ getConnectedIdentityMetadata }: IGetMetadataProps): JSX.Element => (
  <div>
    <h2>Get Connected Identity Metadata</h2>

    <button type="button" onClick={getConnectedIdentityMetadata}>
      Get Connected Identity
    </button>
  </div>
);
