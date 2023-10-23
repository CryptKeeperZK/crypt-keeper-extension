import { useCallback, useEffect, useState } from "react";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";
import { useSearchParam } from "@src/ui/hooks/url";
import {
  deserializeVerifiableCredential,
  hashVerifiableCredential,
  serializeVerifiableCredential,
} from "@src/util/credentials";

export const defaultVerifiableCredentialName = "Verifiable Credential";

export interface IUseAddVerifiableCredentialData {
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const serializedVC = useSearchParam("serializedVerifiableCredential");

  useEffect(() => {
    async function deserialize() {
      if (!serializedVC) {
        return;
      }

      const deserializedVerifiableCredential = await deserializeVerifiableCredential(serializedVC);
      setCryptkeeperVerifiableCredential({
        verifiableCredential: deserializedVerifiableCredential,
        metadata: {
          hash: hashVerifiableCredential(deserializedVerifiableCredential),
          name: defaultVerifiableCredentialName,
        },
      });
    }

    setIsLoading(true);
    deserialize().finally(() => {
      setIsLoading(false);
    });
  }, [serializedVC, setIsLoading, setError, setCryptkeeperVerifiableCredential]);

  const onCloseModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onRenameVerifiableCredential = useCallback(
    (newVerifiableCredentialName: string) => {
      setCryptkeeperVerifiableCredential({
        verifiableCredential: cryptkeeperVerifiableCredential!.verifiableCredential,
        metadata: {
          hash: cryptkeeperVerifiableCredential!.metadata.hash,
          name: newVerifiableCredentialName,
        },
      });
    },
    [cryptkeeperVerifiableCredential],
  );

  const onApproveVerifiableCredential = useCallback(async () => {
    const serialized = serializeVerifiableCredential(cryptkeeperVerifiableCredential!.verifiableCredential);

    await dispatch(addVerifiableCredential(serialized, cryptkeeperVerifiableCredential!.metadata.name))
      .then(onCloseModal)
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [cryptkeeperVerifiableCredential, onCloseModal]);

  const onRejectVerifiableCredential = useCallback(async () => {
    await dispatch(rejectVerifiableCredentialRequest());
    onCloseModal();
  }, [dispatch, onCloseModal]);

  return {
    isLoading,
    cryptkeeperVerifiableCredential,
    error,
    onCloseModal,
    onRenameVerifiableCredential,
    onApproveVerifiableCredential,
    onRejectVerifiableCredential,
  };
};
