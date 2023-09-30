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
  onRename: (newVCName: string) => void;
  onApprove: () => Promise<void>;
  onReject: () => void;
}

export const useAddVerifiableCredential = (): IUseAddVerifiableCredentialData => {
  const [cryptkeeperVC, setCryptkeeperVC] = useState<ICryptkeeperVerifiableCredential>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function deserialize() {
      const { searchParams } = new URL(window.location.href.replace("#", ""));
      const serializedVC = searchParams.get("serializedVerifiableCredential");

      if (!serializedVC) {
        return;
      }

      const deserializedVC = await deserializeVC(serializedVC);
      setCryptkeeperVC({
        vc: deserializedVC,
        metadata: {
          hash: hashVC(deserializedVC),
          name: defaultVCName,
        },
      });
    }
    deserialize();
  }, [setCryptkeeperVC]);

  const dispatch = useAppDispatch();

  const onCloseModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onRename = useCallback(
    (newVCName: string) => {
      if (!cryptkeeperVC) {
        return;
      }

      setCryptkeeperVC({
        vc: cryptkeeperVC.vc,
        metadata: {
          hash: cryptkeeperVC.metadata.hash,
          name: newVCName,
        },
      });
    },
    [cryptkeeperVC],
  );

  const onApprove = useCallback(async () => {
    if (!cryptkeeperVC) {
      return;
    }

    const serializedVC = serializeVC(cryptkeeperVC.vc);

    try {
      await dispatch(addVerifiableCredential(serializedVC, cryptkeeperVC.metadata.name));
      onCloseModal();
    } catch (err) {
      setError((err as Error).message);
    }
  }, [cryptkeeperVC, onCloseModal]);

  const onReject = useCallback(async () => {
    await dispatch(rejectVerifiableCredentialRequest());
    onCloseModal();
  }, [dispatch, onCloseModal]);

  return {
    cryptkeeperVC,
    error,
    onCloseModal,
    onRename,
    onApprove,
    onReject,
  };
};
