import { ChangeEvent, useCallback, useState } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { signIdentityMessage } from "@src/ui/services/identity";
import { IdentityStrategy, IdentityWeb2Provider, SelectOption } from "@src/types";
import { useWallet } from "@src/ui/hooks/wallet";
import { WEB2_PROVIDER_OPTIONS, IDENTITY_TYPES } from "@src/constants";
import { ActionMeta, OnChangeValue } from "react-select";

export interface IUseCreateIdentityModalArgs {
  onClose: () => void;
}

export interface IUseCreateIdentityModalData {
  isLoading: boolean;
  nonce: number;
  error: string;
  identityStrategyType: SelectOption;
  web2Provider: SelectOption;
  onSelectIdentityType: (value: OnChangeValue<SelectOption, boolean>, actionMeta: ActionMeta<SelectOption>) => void;
  onSelectWeb2Provider: (value: OnChangeValue<SelectOption, boolean>, actionMeta: ActionMeta<SelectOption>) => void;
  onChangeNonce: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreateIdentity: () => void;
}

export const useCreateIdentityModal = ({ onClose }: IUseCreateIdentityModalArgs): IUseCreateIdentityModalData => {
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
        await dispatch(createIdentity(identityStrategyType.value, messageSignature, options));
      }

      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [nonce, web2Provider, identityStrategyType, address, provider]);

  return {
    isLoading,
    error,
    nonce,
    identityStrategyType,
    web2Provider,
    onSelectIdentityType,
    onSelectWeb2Provider,
    onChangeNonce,
    onCreateIdentity,
  };
};
