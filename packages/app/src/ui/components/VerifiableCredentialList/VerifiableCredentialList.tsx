import { VerifiableCredential } from "@cryptkeeperzk/types";
import Typography from "@mui/material/Typography";
import { FlattenedCryptkeeperVerifiableCredential } from "@src/types";
import { VerifiableCredentialItem } from "./Item";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useCallback } from "react";

import "./verifiableCredentialListStyles.scss";

export interface VerifiableCredentialsListProps {
  verifiableCredentials: FlattenedCryptkeeperVerifiableCredential[];
}

export const VerifiableCredentialsList = ({ verifiableCredentials }: VerifiableCredentialsListProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const onRenameVerifiableCredential = useCallback(
    async (verifiableCredentialHash: string, name: string) => {
      console.log(`renaming verifiable credential ${verifiableCredentialHash} to ${name}`);
      // await dispatch(setVerifiableCredentialName(verifiableCredentialHash, name));
    },
    [dispatch],
  );

  const onDeleteVerifiableCredential = useCallback(
    async (verifiableCredentialHash: string) => {
      console.log(`deleting verifiable credential ${verifiableCredentialHash}`);
      // await dispatch(deleteVerifiableCredential(verifiableCredentialHash));
    },
    [dispatch],
  );

  return (
    <>
      <div className="verifiable-credential-content">
        {verifiableCredentials.map(({ verifiableCredential, metadata }) => (
          <VerifiableCredentialItem
            key={metadata.hash}
            verifiableCredential={verifiableCredential}
            metadata={metadata}
            onRenameVerifiableCredential={onRenameVerifiableCredential}
            onDeleteVerifiableCredential={onDeleteVerifiableCredential}
          />
        ))}

        {verifiableCredentials.length === 0 && (
          <Typography sx={{ my: 2, textAlign: "center" }}>No Verifiable Credentials available</Typography>
        )}
      </div>
    </>
  );
};
