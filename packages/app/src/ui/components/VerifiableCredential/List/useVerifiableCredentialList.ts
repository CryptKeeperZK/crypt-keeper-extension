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
  onRenameVC: (vcHash: string, newVCName: string) => Promise<void>;
  onDeleteVC: (vcHash: string) => Promise<void>;
}

export const useVerifiableCredentialList = (): IUseVerifiableCredentialListData => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchVerifiableCredentials());
  }, [dispatch, fetchVerifiableCredentials]);

  const cryptkeeperVCs = useCryptkeeperVerifiableCredentials();

  /**
   * Renames a Verifiable Credential in the wallet.
   * @param verifiableCredentialHash - The hash of the Verifiable Credential to rename.
   * @param newVerifiableCredentialName - The new name for the Verifiable Credential.
   */
  const onRenameVC = useCallback(
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

  /**
   * Deletes a Verifiable Credential from the wallet.
   * @param verifiableCredentialHash - The hash of the Verifiable Credential to delete.
   */
  const onDeleteVC = useCallback(
    async (verifiableCredentialHash: string) => {
      await dispatch(deleteVerifiableCredential(verifiableCredentialHash));
      dispatch(fetchVerifiableCredentials());
    },
    [dispatch],
  );

  return {
    cryptkeeperVCs,
    onRenameVC,
    onDeleteVC,
  };
};
