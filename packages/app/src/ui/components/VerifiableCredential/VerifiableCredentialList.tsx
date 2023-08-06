import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";

import { deserializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteVerifiableCredential, renameVerifiableCredential } from "@src/ui/ducks/verifiableCredentials";

import { VerifiableCredentialItem } from "./Item";
import "./verifiableCredentialListStyles.scss";

export interface VerifiableCredentialsListProps {
  serializedVerifiableCredentials: string[];
}

export const VerifiableCredentialsList = ({
  serializedVerifiableCredentials,
}: VerifiableCredentialsListProps): JSX.Element => {
  const dispatch = useAppDispatch();

  const [cryptkeeperVerifiableCredentials, setCryptkeeperVerifiableCredentials] = useState<
    CryptkeeperVerifiableCredential[]
  >([]);

  useEffect(() => {
    async function deserialize() {
      const deserializedVerifiableCredentials = await Promise.all(
        serializedVerifiableCredentials.map(async (serializedVerifiableCredential) =>
          deserializeCryptkeeperVerifiableCredential(serializedVerifiableCredential),
        ),
      );
      setCryptkeeperVerifiableCredentials(deserializedVerifiableCredentials);
    }
    deserialize();
  }, [serializedVerifiableCredentials]);

  const onRenameVerifiableCredential = useCallback(
    async (verifiableCredentialHash: string, newVerifiableCredentialName: string) => {
      await dispatch(
        renameVerifiableCredential({
          verifiableCredentialHash,
          newVerifiableCredentialName,
        }),
      );
    },
    [dispatch],
  );

  const onDeleteVerifiableCredential = useCallback(
    async (verifiableCredentialHash: string) => {
      await dispatch(deleteVerifiableCredential(verifiableCredentialHash));
    },
    [dispatch],
  );

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
