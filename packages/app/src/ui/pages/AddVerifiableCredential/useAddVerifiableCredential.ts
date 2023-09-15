import { useCallback, useEffect, useState } from "react";

import { deserializeVC, hashVC, serializeVC } from "@src/background/services/credentials/utils";
import { ICryptkeeperVerifiableCredential } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";

export const defaultVCName = "Verifiable Credential";

export interface IUseAddVerifiableCredentialData {
  cryptkeeperVC?: ICryptkeeperVerifiableCredential;
  error?: string;
  onCloseModal: () => void;
  onRenameVC: (newVCName: string) => void;
  onApproveVC: () => Promise<void>;
  onRejectVC: () => void;
}

export const useAddVerifiableCredential = (): IUseAddVerifiableCredentialData => {
  const [cryptkeeperVC, setCryptkeeperVC] = useState<ICryptkeeperVerifiableCredential>();
  const [error, setError] = useState<string>();

  /**
   * Fetches the serialized Verifiable Credential from the window url.
   */
  useEffect(() => {
    async function deserialize() {
      const { searchParams } = new URL(window.location.href.replace("#", ""));
      const serializedVC = searchParams.get("serializedVerifiableCredential");

      if (!serializedVC) {
        return;
      }

      const deserializedVC = await deserializeVC(serializedVC);
      setCryptkeeperVC({
        verifiableCredential: deserializedVC,
        metadata: {
          hash: hashVC(deserializedVC),
          name: defaultVCName,
        },
      });
    }
    deserialize();
  }, [setCryptkeeperVC]);

  const dispatch = useAppDispatch();

  /**
   * Closes the modal.
   */
  const onCloseModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  /**
   * Renames the Verifiable Credential.
   * @param newVCName - The new name for the Verifiable Credential.
   */
  const onRenameVC = useCallback(
    (newVCName: string) => {
      if (!cryptkeeperVC) {
        return;
      }

      setCryptkeeperVC({
        verifiableCredential: cryptkeeperVC.verifiableCredential,
        metadata: {
          hash: cryptkeeperVC.metadata.hash,
          name: newVCName,
        },
      });
    },
    [cryptkeeperVC],
  );

  /**
   * Approves adding the Verifiable Credential.
   */
  const onApproveVC = useCallback(async () => {
    if (!cryptkeeperVC) {
      return;
    }

    const serializedVC = serializeVC(cryptkeeperVC.verifiableCredential);

    try {
      await dispatch(addVerifiableCredential(serializedVC, cryptkeeperVC.metadata.name));
      onCloseModal();
    } catch (err) {
      setError((err as Error).message);
    }
  }, [cryptkeeperVC, onCloseModal]);

  /**
   * Rejects adding the Verifiable Credential.
   */
  const onRejectVC = useCallback(async () => {
    await dispatch(rejectVerifiableCredentialRequest());
    onCloseModal();
  }, [dispatch, onCloseModal]);

  return {
    cryptkeeperVC,
    error,
    onCloseModal,
    onRenameVC,
    onApproveVC,
    onRejectVC,
  };
};
