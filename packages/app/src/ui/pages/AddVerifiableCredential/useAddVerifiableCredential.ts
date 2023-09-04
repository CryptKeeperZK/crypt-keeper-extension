import { useCallback, useEffect, useState } from "react";

import {
  deserializeVerifiableCredential,
  hashVerifiableCredential,
  serializeVerifiableCredential,
} from "@src/background/services/credentials/utils";
import { ICryptkeeperVerifiableCredential } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";

export const defaultVerifiableCredentialName = "Verifiable Credential";

export interface IUseAddVerifiableCredentialData {
  cryptkeeperVerifiableCredential?: ICryptkeeperVerifiableCredential;
  error?: string;
  onCloseModal: () => void;
  onRenameVerifiableCredential: (newVerifiableCredentialName: string) => void;
  onApproveVerifiableCredential: () => Promise<void>;
  onRejectVerifiableCredential: () => void;
}

export const useAddVerifiableCredential = (): IUseAddVerifiableCredentialData => {
  const [cryptkeeperVerifiableCredential, setCryptkeeperVerifiableCredential] =
    useState<ICryptkeeperVerifiableCredential>();
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
  }, [setCryptkeeperVerifiableCredential]);

  const dispatch = useAppDispatch();

  const onCloseModal = useCallback(() => {
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
      onCloseModal();
    } catch (err) {
      setError((err as Error).message);
    }
  }, [cryptkeeperVerifiableCredential, onCloseModal]);

  const onRejectVerifiableCredential = useCallback(async () => {
    await dispatch(rejectVerifiableCredentialRequest());
    onCloseModal();
  }, [dispatch, onCloseModal]);

  return {
    cryptkeeperVerifiableCredential,
    error,
    onCloseModal,
    onRenameVerifiableCredential,
    onApproveVerifiableCredential,
    onRejectVerifiableCredential,
  };
};
