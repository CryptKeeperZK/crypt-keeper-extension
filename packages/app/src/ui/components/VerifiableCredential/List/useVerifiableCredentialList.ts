import { useCallback, useEffect } from "react";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteVC, fetchVCs, renameVC } from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVCs } from "@src/ui/hooks/verifiableCredentials";

export interface IUseVerifiableCredentialListData {
  cryptkeeperVCs: ICryptkeeperVerifiableCredential[];
  onRename: (hash: string, name: string) => Promise<void>;
  onDelete: (hash: string) => Promise<void>;
}

export const useVerifiableCredentialList = (): IUseVerifiableCredentialListData => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchVCs());
  }, [dispatch, fetchVCs]);

  const cryptkeeperVCs = useCryptkeeperVCs();

  const onRename = useCallback(
    async (hash: string, name: string) => {
      await dispatch(
        renameVC({
          hash,
          name,
        }),
      );

      dispatch(fetchVCs());
    },
    [dispatch],
  );

  const onDelete = useCallback(
    async (verifiableCredentialHash: string) => {
      await dispatch(deleteVC(verifiableCredentialHash));
      dispatch(fetchVCs());
    },
    [dispatch],
  );

  return {
    cryptkeeperVCs,
    onRename,
    onDelete,
  };
};
