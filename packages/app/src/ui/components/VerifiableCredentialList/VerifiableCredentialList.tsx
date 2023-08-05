import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";

import { deserializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteVerifiableCredential, renameVerifiableCredential } from "@src/ui/ducks/verifiableCredentials";

import { VerifiableCredentialItem } from "./Item";
import "./verifiableCredentialListStyles.scss";

export interface VerifiableCredentialsListProps {
  verifiableCredentials: string[];
}

export const VerifiableCredentialsList = ({ verifiableCredentials }: VerifiableCredentialsListProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const [credentials, setCredentials] = useState<CryptkeeperVerifiableCredential[]>([]);

  useEffect(() => {
    async function deserialize() {
      const deserializedVerifiableCredentials = await Promise.all(
        verifiableCredentials.map(async (verifiableCredential) =>
          deserializeCryptkeeperVerifiableCredential(verifiableCredential),
        ),
      );
      setCredentials(deserializedVerifiableCredentials);
    }
    deserialize();
  }, [verifiableCredentials]);

  const onRenameVerifiableCredential = useCallback(
    async (verifiableCredentialHash: string, name: string) => {
      await dispatch(
        renameVerifiableCredential({
          verifiableCredentialHash,
          newVerifiableCredentialName: name,
        }),
      );
    },
    [dispatch],
  );

  const onDeleteVerifiableCredential = useCallback(
    async (verifiableCredentialHash: string) => {
      await dispatch(deleteVerifiableCredential({ verifiableCredentialHash }));
    },
    [dispatch],
  );

  return (
    <div className="verifiable-credential-content">
      {credentials.map(({ verifiableCredential, metadata }) => (
        <VerifiableCredentialItem
          key={metadata.hash}
          metadata={metadata}
          verifiableCredential={verifiableCredential}
          onDeleteVerifiableCredential={onDeleteVerifiableCredential}
          onRenameVerifiableCredential={onRenameVerifiableCredential}
        />
      ))}

      {verifiableCredentials.length === 0 && (
        <Typography sx={{ my: 2, textAlign: "center" }}>No Verifiable Credentials available</Typography>
      )}
    </div>
  );
};
