interface IVerifiableCredentialsProps {
  addVerifiableCredentialRequest: (credentialType: string) => Promise<void>;
  generateVerifiablePresentationRequest: () => Promise<void>;
}

export const VerifiableCredentials = ({
  addVerifiableCredentialRequest,
  generateVerifiablePresentationRequest,
}: IVerifiableCredentialsProps): JSX.Element => (
  <div>
    <h2>Verifiable Credentials</h2>

    <button
      data-testid="add-verifiable-credential"
      type="button"
      onClick={() => addVerifiableCredentialRequest("UniversityDegreeCredential")}
    >
      Add a University Degree Verifiable Credential
    </button>

    <br />

    <br />

    <button
      data-testid="add-verifiable-credential"
      type="button"
      onClick={() => addVerifiableCredentialRequest("DriversLicenseCredential")}
    >
      Add a Drivers License Verifiable Credential
    </button>

    <br />

    <br />

    <button data-testid="add-verifiable-credential" type="button" onClick={generateVerifiablePresentationRequest}>
      Generate a Verifiable Presentation
    </button>
  </div>
);
