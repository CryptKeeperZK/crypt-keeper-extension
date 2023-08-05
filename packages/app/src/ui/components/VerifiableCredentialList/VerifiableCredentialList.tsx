import { VerifiableCredential } from "@cryptkeeperzk/types";
import Typography from "@mui/material/Typography";
import { CryptkeeperVerifiableCredential } from "@src/types";
import { VerifiableCredentialItem } from "./Item";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useCallback, useEffect, useState } from "react";

import "./verifiableCredentialListStyles.scss";
import { deserializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";

export interface VerifiableCredentialsListProps {
  verifiableCredentials: string[];
}

export const VerifiableCredentialsList = ({ verifiableCredentials }: VerifiableCredentialsListProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const [credentials, setCredentials] = useState<CryptkeeperVerifiableCredential[]>([]);

  useEffect(() => {
    async function deserialize() {
      const deserializedVerifiableCredentials = await Promise.all(
        verifiableCredentials.map(async (verifiableCredential) => {
          return deserializeCryptkeeperVerifiableCredential(verifiableCredential);
        }),
      );
      setCredentials(deserializedVerifiableCredentials);
    }
    deserialize();
  }, [verifiableCredentials]);

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
        {credentials.map(({ verifiableCredential, metadata }) => (
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
