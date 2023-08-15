import { useCallback, useEffect, useState } from "react";

import { deserializeCryptkeeperVerifiableCredential } from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  deleteVerifiableCredential,
  fetchVerifiableCredentials,
  renameVerifiableCredential,
} from "@src/ui/ducks/verifiableCredentials";

export interface IUseVerifiableCredentialListData {
  cryptkeeperVerifiableCredentials: CryptkeeperVerifiableCredential[];
  onRenameVerifiableCredential: (
    verifiableCredentialHash: string,
    newVerifiableCredentialName: string,
  ) => Promise<void>;
  onDeleteVerifiableCredential: (verifiableCredentialHash: string) => Promise<void>;
}

export const useVerifiableCredentialList = (
  serializedVerifiableCredentials: string[],
): IUseVerifiableCredentialListData => {
  const dispatch = useAppDispatch();

  const [cryptkeeperVerifiableCredentials, setCryptkeeperVerifiableCredentials] = useState<
    CryptkeeperVerifiableCredential[]
  >([]);

  useEffect(() => {
    async function deserialize() {
      const deserializedVerifiableCredentials = await Promise.all(
        serializedVerifiableCredentials.map((serializedVerifiableCredential) =>
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
      dispatch(fetchVerifiableCredentials());
    },
    [dispatch],
  );

  const onDeleteVerifiableCredential = useCallback(
    async (verifiableCredentialHash: string) => {
      await dispatch(deleteVerifiableCredential(verifiableCredentialHash));
      dispatch(fetchVerifiableCredentials());
    },
    [dispatch],
  );

  return {
    cryptkeeperVerifiableCredentials,
    onRenameVerifiableCredential,
    onDeleteVerifiableCredential,
  };
};
