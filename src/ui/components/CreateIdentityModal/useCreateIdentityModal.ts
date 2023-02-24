import { ChangeEvent, useCallback, useState } from "react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { signIdentityMessage } from "@src/ui/services/identity";
import { IdentityStrategy, IdentityWeb2Provider } from "@src/types";
import { useWallet } from "@src/ui/hooks/wallet";

export interface IUseCreateIdentityModalArgs {
  onClose: () => void;
}

export interface IUseCreateIdentityModalData {
  isLoading: boolean;
  nonce: number;
  error: string;
  identityStrategyType: IdentityStrategy;
  web2Provider: IdentityWeb2Provider;
  onSelectIdentityType: (event: ChangeEvent<HTMLSelectElement>) => void;
  onSelectWeb2Provider: (event: ChangeEvent<HTMLSelectElement>) => void;
  onChangeNonce: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreateIdentity: () => void;
}

export const useCreateIdentityModal = ({ onClose }: IUseCreateIdentityModalArgs): IUseCreateIdentityModalData => {
  const [nonce, setNonce] = useState(0);
  const [identityStrategyType, setIdentityStrategyType] = useState<IdentityStrategy>("interrep");
  const [web2Provider, setWeb2Provider] = useState<IdentityWeb2Provider>("twitter");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { address, provider } = useWallet();

  const onSelectIdentityType = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setIdentityStrategyType(event.target.value as IdentityStrategy);
    },
    [setIdentityStrategyType],
  );

  const onSelectWeb2Provider = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setWeb2Provider(event.target.value as unknown as IdentityWeb2Provider);
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
      const options = identityStrategyType !== "random" ? { nonce, web2Provider, account: address } : {};
      const messageSignature = await signIdentityMessage({
        web2Provider,
        nonce,
        signer: provider?.getSigner(),
        identityStrategyType,
      });

      if (messageSignature) {
        await dispatch(createIdentity(identityStrategyType, messageSignature, options));
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
