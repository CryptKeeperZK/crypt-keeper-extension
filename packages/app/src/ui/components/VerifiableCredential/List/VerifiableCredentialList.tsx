import Typography from "@mui/material/Typography";

import { VerifiableCredentialItem } from "../Item";

import { useVerifiableCredentialList } from "./useVerifiableCredentialList";
import "./verifiableCredentialListStyles.scss";

export interface VerifiableCredentialListProps {
  serializedVerifiableCredentials: string[];
}

export const VerifiableCredentialList = ({
  serializedVerifiableCredentials,
}: VerifiableCredentialListProps): JSX.Element => {
  const { cryptkeeperVerifiableCredentials, onRenameVerifiableCredential, onDeleteVerifiableCredential } =
    useVerifiableCredentialList(serializedVerifiableCredentials);

  return (
    <div className="verifiable-credential-content">
      {cryptkeeperVerifiableCredentials.map(({ verifiableCredential, metadata }) => (
        <VerifiableCredentialItem
          key={metadata.hash}
          metadata={metadata}
          verifiableCredential={verifiableCredential}
          onDeleteVerifiableCredential={onDeleteVerifiableCredential}
          onRenameVerifiableCredential={onRenameVerifiableCredential}
        />
      ))}

      {serializedVerifiableCredentials.length === 0 && (
        <Typography sx={{ my: 2, textAlign: "center" }}>No Verifiable Credentials available</Typography>
      )}
    </div>
  );
};
