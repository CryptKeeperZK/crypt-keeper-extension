import { ChangeEvent, useCallback, useState } from "react";
import { ActionMeta, OnChangeValue } from "react-select";

import { WEB2_PROVIDER_OPTIONS, IDENTITY_TYPES } from "@src/constants";
import { IdentityStrategy, IdentityWeb2Provider, SelectOption } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useWallet } from "@src/ui/hooks/wallet";
import { signIdentityMessage } from "@src/ui/services/identity";

export interface IUseCreateIdentityData {
  isLoading: boolean;
  nonce: number;
  error: string;
  identityStrategyType: SelectOption;
  web2Provider: SelectOption;
  closeModal: () => void;
  onSelectIdentityType: (value: OnChangeValue<SelectOption, boolean>, actionMeta: ActionMeta<SelectOption>) => void;
  onSelectWeb2Provider: (value: OnChangeValue<SelectOption, boolean>, actionMeta: ActionMeta<SelectOption>) => void;
  onChangeNonce: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreateIdentity: () => Promise<void>;
}

export const useCreateIdentity = (): IUseCreateIdentityData => {
  const [nonce, setNonce] = useState(0);
  const [identityStrategyType, setIdentityStrategyType] = useState(IDENTITY_TYPES[0]);
  const [web2Provider, setWeb2Provider] = useState(WEB2_PROVIDER_OPTIONS[0]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { address, provider } = useWallet();

  const onSelectIdentityType = useCallback(
    (value: OnChangeValue<SelectOption, boolean>) => {
      setIdentityStrategyType(value as SelectOption);
    },
    [setIdentityStrategyType],
  );

  const onSelectWeb2Provider = useCallback(
    (value: OnChangeValue<SelectOption, boolean>) => {
      setWeb2Provider(value as SelectOption);
    },
    [setWeb2Provider],
  );

  const onChangeNonce = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setNonce(Number(event.target.value)),
    [setNonce],
  );

  const onCreateIdentity = useCallback(async () => {
    setIsLoading(true);

    try {
      const options =
        identityStrategyType.value !== "random"
          ? { nonce, web2Provider: web2Provider.value as IdentityWeb2Provider, account: address }
          : {};
      const signer = await provider?.getSigner();

      const messageSignature = await signIdentityMessage({
        web2Provider: web2Provider.value as IdentityWeb2Provider,
        nonce,
        signer,
        identityStrategyType: identityStrategyType.value as IdentityStrategy,
      });

      if (messageSignature) {
        dispatch(createIdentity(identityStrategyType.value as IdentityStrategy, messageSignature, options));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [nonce, web2Provider, identityStrategyType, address, provider, dispatch, setError, setIsLoading]);

  const closeModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  return {
    isLoading,
    error,
    nonce,
    identityStrategyType,
    web2Provider,
    closeModal,
    onSelectIdentityType,
    onSelectWeb2Provider,
    onChangeNonce,
    onCreateIdentity,
  };
};
