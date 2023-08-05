import { Typography } from "@mui/material";
import { deserializeVerifiableCredential } from "@src/background/services/credentials/utils";
import { VerifiableCredential, VerifiableCredentialMetadata } from "@src/types";
import { useEffect, useState } from "react";

export interface VerifiableCredentialDisplayProps {
  serializedVerifiableCredential: string;
  verifiableCredentialMetadata?: VerifiableCredentialMetadata;
}

export const VerifiableCredentialDisplay = ({
  serializedVerifiableCredential,
  verifiableCredentialMetadata,
}: VerifiableCredentialDisplayProps): JSX.Element => {
  const [verifiableCredential, setVerifiableCredential] = useState<VerifiableCredential | undefined>(undefined);

  useEffect(() => {
    async function deserialize() {
      const deserializedVerifiableCredential = await deserializeVerifiableCredential(serializedVerifiableCredential);
      setVerifiableCredential(deserializedVerifiableCredential);
    }
    deserialize();
  }, [serializedVerifiableCredential]);

  if (!verifiableCredential) {
    return <Typography>There was an error deserializing the Verifiable Credential.</Typography>;
  }

  const issuerId =
    typeof verifiableCredential.issuer === "string" ? verifiableCredential.issuer : verifiableCredential.issuer.id;

  return (
    <div>
      <Typography variant="h6">Verifiable Credential</Typography>
      <Typography variant="body1">Type: {verifiableCredential.type}</Typography>
      <Typography variant="body1">Issuer: {issuerId}</Typography>
      <Typography variant="body1">Issuance Date: {verifiableCredential.issuanceDate.toString()}</Typography>
      <Typography variant="body1">Expiration Date: {verifiableCredential.expirationDate?.toString()}</Typography>
      <Typography variant="body1">Credential Subject Id: {verifiableCredential.credentialSubject.id}</Typography>
      <Typography variant="body1">
        Credential Subject Claims: {JSON.stringify(verifiableCredential.credentialSubject.claims)}
      </Typography>
    </div>
  );
};
