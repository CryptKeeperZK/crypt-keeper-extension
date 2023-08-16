import { useCallback, useEffect, useState } from "react";

import {
  deserializeVerifiableCredential,
  hashVerifiableCredential,
  serializeVerifiableCredential,
} from "@src/background/services/credentials/utils";
import { CryptkeeperVerifiableCredential } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";

export const defaultVerifiableCredentialName = "Verifiable Credential";

export interface IUseAddVerifiableCredentialData {
  cryptkeeperVerifiableCredential?: CryptkeeperVerifiableCredential;
  error?: string;
  closeModal: () => void;
  onRenameVerifiableCredential: (newVerifiableCredentialName: string) => void;
  onApproveVerifiableCredential: () => Promise<void>;
  onRejectVerifiableCredential: () => void;
}

export const useAddVerifiableCredential = (): IUseAddVerifiableCredentialData => {
  const [cryptkeeperVerifiableCredential, setCryptkeeperVerifiableCredential] =
    useState<CryptkeeperVerifiableCredential>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function deserialize() {
      const { searchParams } = new URL(window.location.href.replace("#", ""));
      const serializedVerifiableCredential = searchParams.get("serializedVerifiableCredential");

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
  }, []);

  const dispatch = useAppDispatch();

  const closeModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

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
    if (!cryptkeeperVerifiableCredential) {
      return;
    }

    const serializedVerifiableCredential = serializeVerifiableCredential(
      cryptkeeperVerifiableCredential.verifiableCredential,
    );

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

  const onRejectVerifiableCredential = useCallback(async () => {
    await dispatch(rejectVerifiableCredentialRequest());
    closeModal();
  }, [dispatch, closeModal]);

  return {
    cryptkeeperVerifiableCredential,
    error,
    closeModal,
    onRenameVerifiableCredential,
    onApproveVerifiableCredential,
    onRejectVerifiableCredential,
  };
};
