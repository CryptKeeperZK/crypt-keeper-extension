import { useCallback } from "react";

import { CryptkeeperVerifiableCredential } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  deleteVerifiableCredential,
  fetchVerifiableCredentials,
  renameVerifiableCredential,
  useCryptkeeperVerifiableCredentials,
} from "@src/ui/ducks/verifiableCredentials";

export interface IUseVerifiableCredentialListData {
  cryptkeeperVerifiableCredentials: CryptkeeperVerifiableCredential[];
  onRenameVerifiableCredential: (
    verifiableCredentialHash: string,
    newVerifiableCredentialName: string,
  ) => Promise<void>;
  onDeleteVerifiableCredential: (verifiableCredentialHash: string) => Promise<void>;
}

export const useVerifiableCredentialList = (): IUseVerifiableCredentialListData => {
  const dispatch = useAppDispatch();
  dispatch(fetchVerifiableCredentials());

  const cryptkeeperVerifiableCredentials = useCryptkeeperVerifiableCredentials();

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
