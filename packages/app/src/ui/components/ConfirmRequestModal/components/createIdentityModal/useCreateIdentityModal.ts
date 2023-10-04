import { EWallet } from "@cryptkeeperzk/types";
import { BaseSyntheticEvent, useCallback } from "react";
import { Control, useForm, UseFormRegister } from "react-hook-form";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { getMessageTemplate, signWithSigner } from "@src/ui/services/identity";

export interface IUseCreateIdentityModalArgs {
  urlOrigin: string;
  connectIdentityCallback: (event?: React.MouseEvent<HTMLAnchorElement>) => void;
  reject: () => void;
}

export interface IUseCreateIdentityData {
  isLoading: boolean;
  isWalletConnected: boolean;
  isWalletInstalled: boolean;
  errors: Partial<{
    root: string;
    identityStrategyType: string;
    web2Provider: string;
    nonce: string;
  }>;
  control: Control<FormFields, unknown>;
  urlOrigin?: string;
  onCloseModal: () => void;
  register: UseFormRegister<FormFields>;
  onConnectWallet: () => Promise<void>;
  onCreateWithEthWallet: (event?: BaseSyntheticEvent) => Promise<void>;
  onCreateWithCryptkeeper: (event?: BaseSyntheticEvent) => Promise<void>;
}

interface FormFields {
  nonce: number;
  isDeterministic: boolean;
}

export const useCreateIdentityModal = ({
  urlOrigin,
  connectIdentityCallback,
  reject,
}: IUseCreateIdentityModalArgs): IUseCreateIdentityData => {
  const {
    formState: { isSubmitting, isLoading, errors },
    control,
    setError,
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      nonce: 0,
      isDeterministic: true,
    },
  });

  const ethWallet = useEthWallet();
  const cryptKeeperWallet = useCryptKeeperWallet();
  const dispatch = useAppDispatch();

  const createNewIdentity = useCallback(
    async ({ nonce, isDeterministic }: FormFields, walletType: EWallet) => {
      try {
        const account =
          walletType === EWallet.ETH_WALLET
            ? ethWallet.address?.toLowerCase()
            : cryptKeeperWallet.address?.toLowerCase();
        const message = getMessageTemplate({
          nonce,
          account: account!,
        });

        const options = { message, account: account!, nonce };

        const messageSignature =
          walletType === EWallet.ETH_WALLET && isDeterministic
            ? await signWithSigner({ signer: await ethWallet.provider?.getSigner(), message })
            : undefined;

        await dispatch(
          createIdentity({
            messageSignature,
            isDeterministic,
            options,
            walletType,
            groups: [],
            urlOrigin,
          }),
        );

        connectIdentityCallback();
      } catch (err) {
        setError("root", { type: "submit", message: (err as Error).message });
      }
    },
    [ethWallet.address, ethWallet.provider, cryptKeeperWallet.address, urlOrigin, dispatch],
  );

  const onCreateIdentityWithEthWallet = useCallback(
    async (data: FormFields) => createNewIdentity(data, EWallet.ETH_WALLET),
    [ethWallet.isActive, createNewIdentity, setError],
  );

  const onCreateIdentityWithCryptkeeper = useCallback(
    async (data: FormFields) => createNewIdentity(data, EWallet.CRYPTKEEPER_WALLET),
    [setError, createNewIdentity],
  );

  const onConnectWallet = useCallback(async () => {
    await ethWallet.onConnect().catch(() => {
      setError("root", { type: "submit", message: "Wallet connection error" });
    });
  }, [setError, ethWallet.onConnect]);

  const onCloseModal = useCallback(() => {
    reject();
  }, [dispatch]);

  return {
    isLoading: ethWallet.isActivating || cryptKeeperWallet.isActivating || isLoading || isSubmitting,
    isWalletInstalled: ethWallet.isInjectedWallet,
    isWalletConnected: ethWallet.isActive,
    errors: {
      nonce: errors.nonce?.message,
      root: errors.root?.message,
    },
    control,
    urlOrigin,
    register,
    onCloseModal,
    onConnectWallet: handleSubmit(onConnectWallet),
    onCreateWithEthWallet: handleSubmit(onCreateIdentityWithEthWallet),
    onCreateWithCryptkeeper: handleSubmit(onCreateIdentityWithCryptkeeper),
  };
};
