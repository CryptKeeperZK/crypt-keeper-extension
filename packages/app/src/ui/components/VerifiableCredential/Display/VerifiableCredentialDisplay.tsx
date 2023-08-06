import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { deserializeVerifiableCredential } from "@src/background/services/credentials/utils";
import { VerifiableCredential, VerifiableCredentialMetadata } from "@src/types";

export interface VerifiableCredentialDisplayProps {
  serializedVerifiableCredential: string;
  verifiableCredentialMetadata?: VerifiableCredentialMetadata;
}

export const VerifiableCredentialDisplay = ({
  serializedVerifiableCredential,
  verifiableCredentialMetadata = undefined,
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

  const credentialName = verifiableCredentialMetadata ? verifiableCredentialMetadata.name : "Verifiable Credential";
  const issuerId =
    typeof verifiableCredential.issuer === "string" ? verifiableCredential.issuer : verifiableCredential.issuer.id;

  return (
    <div>
      <Typography variant="h6">{credentialName}</Typography>

      <Typography variant="body1">
        <u>Type:</u>

        {` ${verifiableCredential.type.join(", ")}`}
      </Typography>

      <Typography variant="body1">
        <u>Issuer:</u>

        {` ${issuerId}`}
      </Typography>

      <Typography variant="body1">
        <u>Issuance Date:</u>

        {` ${verifiableCredential.issuanceDate.toString()}`}
      </Typography>

      <Typography variant="body1">
        <u>Expiration Date:</u>

        {` ${verifiableCredential.expirationDate?.toString()}`}
      </Typography>

      <Typography variant="body1">
        <u>Credential Subject Id:</u>

        {` ${verifiableCredential.credentialSubject.id}`}
      </Typography>

      <Typography variant="body1">
        <u>Credential Subject Claims:</u>

        {` ${JSON.stringify(verifiableCredential.credentialSubject.claims)}`}
      </Typography>
    </div>
  );
};
