import { EventName } from "@cryptkeeperzk/providers";
import { useCallback, useEffect, useState } from "react";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { addVC } from "@src/ui/ducks/verifiableCredentials";
import { useSearchParam } from "@src/ui/hooks/url";
import { deserializeVC, hashVC, serializeVC } from "@src/util/credentials";

export const defaultVCName = "Verifiable Credential";

export interface IUseAddVerifiableCredentialData {
  isLoading: boolean;
  cryptkeeperVC?: ICryptkeeperVerifiableCredential;
  error?: string;
  onCloseModal: () => void;
  onRename: (newVerifiableCredentialName: string) => void;
  onApprove: () => Promise<void>;
  onReject: () => void;
}

export const useAddVerifiableCredential = (): IUseAddVerifiableCredentialData => {
  const [cryptkeeperVC, setCryptkeeperVC] = useState<ICryptkeeperVerifiableCredential>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useAppDispatch();
  const serializedVC = useSearchParam("serializedVerifiableCredential");
  const urlOrigin = useSearchParam("urlOrigin");

  useEffect(() => {
    async function deserialize() {
      if (!serializedVC) {
        return;
      }

      const vc = await deserializeVC(serializedVC);
      setCryptkeeperVC({
        verifiableCredential: vc,
        metadata: {
          hash: hashVC(vc),
          name: defaultVCName,
        },
      });
    }

    setIsLoading(true);
    deserialize().finally(() => {
      setIsLoading(false);
    });
  }, [serializedVC, setIsLoading, setError, setCryptkeeperVC]);

  const onCloseModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onRename = useCallback(
    (newVerifiableCredentialName: string) => {
      setCryptkeeperVC({
        verifiableCredential: cryptkeeperVC!.verifiableCredential,
        metadata: {
          hash: cryptkeeperVC!.metadata.hash,
          name: newVerifiableCredentialName,
        },
      });
    },
    [cryptkeeperVC],
  );

  const onApprove = useCallback(async () => {
    const serialized = serializeVC(cryptkeeperVC!.verifiableCredential);

    await dispatch(addVC(serialized, cryptkeeperVC!.metadata.name, urlOrigin!))
      .then(onCloseModal)
      .catch((err: Error) => {
        setError(err.message);
      });
  }, [urlOrigin, cryptkeeperVC, onCloseModal]);

  const onReject = useCallback(async () => {
    await dispatch(rejectUserRequest({ type: EventName.ADD_VERIFIABLE_CREDENTIAL, payload: {} }, urlOrigin));
    onCloseModal();
  }, [urlOrigin, dispatch, onCloseModal]);

  return {
    isLoading,
    cryptkeeperVC,
    error,
    onCloseModal,
    onRename,
    onApprove,
    onReject,
  };
};
