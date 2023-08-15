import { useCallback, useEffect, useState } from "react";

import { deserializeVerifiableCredential, hashVerifiableCredential } from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";

const defaultVerifiableCredentialName = "Verifiable Credential";

export interface IUseAddVerifiableCredentialData {
  cryptkeeperVerifiableCredential?: CryptkeeperVerifiableCredential;
  closeModal: () => void;
  onRenameVerifiableCredential: (newVerifiableCredentialName: string) => void;
  onApproveVerifiableCredential: () => Promise<void>;
  onRejectVerifiableCredential: () => void;
  error: string | undefined;
}

export const useAddVerifiableCredential = (): IUseAddVerifiableCredentialData => {
  const [cryptkeeperVerifiableCredential, setCryptkeeperVerifiableCredential] = useState<
    CryptkeeperVerifiableCredential | undefined
  >(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const { searchParams } = new URL(window.location.href.replace("#", ""));
  const serializedVerifiableCredential = searchParams.get("serializedVerifiableCredential") || undefined;

  useEffect(() => {
    async function deserialize() {
      if (!serializedVerifiableCredential) {
        return;
      }

      const deserializedVerifiableCredential = await deserializeVerifiableCredential(serializedVerifiableCredential);
      setCryptkeeperVerifiableCredential({
        verifiableCredential: deserializedVerifiableCredential,
        metadata: {
          hash: hashVerifiableCredential(deserializedVerifiableCredential),
          name: defaultVerifiableCredentialName,
        },
      });
    }
    deserialize();
  }, [serializedVerifiableCredential]);

  const dispatch = useAppDispatch();

  const closeModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onRejectVerifiableCredential = useCallback(async () => {
    await dispatch(rejectVerifiableCredentialRequest());
    closeModal();
  }, [dispatch, serializedVerifiableCredential, closeModal]);

  const onRenameVerifiableCredential = useCallback(
    (newVerifiableCredentialName: string) => {
      if (!cryptkeeperVerifiableCredential) {
        return;
      }

      setCryptkeeperVerifiableCredential({
        verifiableCredential: cryptkeeperVerifiableCredential.verifiableCredential,
        metadata: {
          hash: cryptkeeperVerifiableCredential.metadata.hash,
          name: newVerifiableCredentialName,
        },
      });
    },
    [cryptkeeperVerifiableCredential],
  );

  const onApproveVerifiableCredential = useCallback(async () => {
    if (!serializedVerifiableCredential || !cryptkeeperVerifiableCredential) {
      return;
    }

    try {
      await dispatch(
        addVerifiableCredential(serializedVerifiableCredential, cryptkeeperVerifiableCredential.metadata.name),
      );
    } catch (err) {
      setError((err as Error).message);
      return;
    }
    closeModal();
  }, [cryptkeeperVerifiableCredential, closeModal]);

  return {
    cryptkeeperVerifiableCredential,
    closeModal,
    onRenameVerifiableCredential,
    onApproveVerifiableCredential,
    onRejectVerifiableCredential,
    error,
  };
};
