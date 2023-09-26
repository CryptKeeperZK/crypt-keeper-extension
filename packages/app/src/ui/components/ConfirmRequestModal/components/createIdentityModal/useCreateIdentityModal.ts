import { EWallet, IdentityStrategy, IdentityWeb2Provider } from "@cryptkeeperzk/types";
import { BaseSyntheticEvent, useCallback } from "react";
import { Control, useForm, UseFormRegister } from "react-hook-form";

import { getEnabledFeatures } from "@src/config/features";
import { WEB2_PROVIDER_OPTIONS, IDENTITY_TYPES } from "@src/constants";
import { SelectOption } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { getMessageTemplate, signWithSigner } from "@src/ui/services/identity";

export interface IUseCreateIdentityModalArgs {
  urlOrigin: string;
  connectIdentityCallback: (event?: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface IUseCreateIdentityData {
  isLoading: boolean;
  isProviderAvailable: boolean;
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
  identityStrategyType: SelectOption;
  web2Provider: SelectOption;
  nonce: number;
}

export const useCreateIdentityModal = ({
  urlOrigin,
  connectIdentityCallback,
}: IUseCreateIdentityModalArgs): IUseCreateIdentityData => {
  const features = getEnabledFeatures();
  const {
    formState: { isSubmitting, isLoading, errors },
    control,
    setError,
    watch,
    register,
    handleSubmit,
  } = useForm({
    defaultValues: {
      identityStrategyType: features.INTEREP_IDENTITY ? IDENTITY_TYPES[0] : IDENTITY_TYPES[1],
      web2Provider: WEB2_PROVIDER_OPTIONS[0],
      nonce: 0,
    },
  });

  const ethWallet = useEthWallet();
  const cryptKeeperWallet = useCryptKeeperWallet();
  const dispatch = useAppDispatch();
  const values = watch();

  const createNewIdentity = useCallback(
    async ({ identityStrategyType, web2Provider, nonce }: FormFields, walletType: EWallet) => {
      try {
        const account =
          walletType === EWallet.ETH_WALLET
            ? ethWallet.address?.toLowerCase()
            : cryptKeeperWallet.address?.toLowerCase();
        const message = getMessageTemplate({
          web2Provider: web2Provider.value as IdentityWeb2Provider,
          nonce,
          identityStrategyType: identityStrategyType.value as IdentityStrategy,
          account: account!,
        });

        const options =
          identityStrategyType.value !== "random"
            ? {
                nonce,
                web2Provider: web2Provider.value as IdentityWeb2Provider,
                account: account!,
                message,
              }
            : { message, account: account! };

        const messageSignature =
          walletType === EWallet.ETH_WALLET
            ? await signWithSigner({ signer: await ethWallet.provider?.getSigner(), message })
            : undefined;

        await dispatch(
          createIdentity({
            strategy: identityStrategyType.value as IdentityStrategy,
            messageSignature,
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
    // reject
  }, [dispatch]);

  return {
    isLoading: ethWallet.isActivating || cryptKeeperWallet.isActivating || isLoading || isSubmitting,
    isWalletInstalled: ethWallet.isInjectedWallet,
    isWalletConnected: ethWallet.isActive,
    isProviderAvailable: values.identityStrategyType.value === "interep",
    errors: {
      web2Provider: errors.web2Provider?.message,
      identityStrategyType: errors.identityStrategyType?.message,
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
