import { useCallback, useEffect } from "react";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  deleteVerifiableCredential,
  fetchVerifiableCredentials,
  renameVerifiableCredential,
} from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVerifiableCredentials } from "@src/ui/hooks/verifiableCredentials";

export interface IUseVerifiableCredentialListData {
  cryptkeeperVCs: ICryptkeeperVerifiableCredential[];
  onRename: (vcHash: string, newVCName: string) => Promise<void>;
  onDelete: (vcHash: string) => Promise<void>;
}

export const useVerifiableCredentialList = (): IUseVerifiableCredentialListData => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchVerifiableCredentials());
  }, [dispatch, fetchVerifiableCredentials]);

  const cryptkeeperVCs = useCryptkeeperVerifiableCredentials();

  const onRename = useCallback(
    async (hash: string, newName: string) => {
      await dispatch(
        renameVerifiableCredential({
          hash,
          newName,
        }),
      );
      dispatch(fetchVerifiableCredentials());
    },
    [dispatch],
  );

  const onDelete = useCallback(
    async (verifiableCredentialHash: string) => {
      await dispatch(deleteVerifiableCredential(verifiableCredentialHash));
      dispatch(fetchVerifiableCredentials());
    },
    [dispatch],
  );

  return {
    cryptkeeperVCs,
    onRename,
    onDelete,
  };
};
