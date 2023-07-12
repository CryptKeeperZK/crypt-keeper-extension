import { BaseSyntheticEvent, useCallback, useMemo } from "react";
import { Control, useForm, UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { getEnabledFeatures } from "@src/config/features";
import { WEB2_PROVIDER_OPTIONS, IDENTITY_TYPES, Paths } from "@src/constants";
import { EWallet, IdentityStrategy, IdentityWeb2Provider, SelectOption } from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { getMessageTemplate, signWithSigner } from "@src/ui/services/identity";

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
  host?: string;
  closeModal: () => void;
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

export const useCreateIdentity = (): IUseCreateIdentityData => {
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
      identityStrategyType: features.INTERREP_IDENTITY ? IDENTITY_TYPES[0] : IDENTITY_TYPES[1],
      web2Provider: WEB2_PROVIDER_OPTIONS[0],
      nonce: 0,
    },
  });
  const navigate = useNavigate();

  const { searchParams } = new URL(window.location.href.replace("#", ""));
  const { isGoBack, host } = useMemo(
    () => ({ isGoBack: searchParams.get("back") === "true", host: searchParams.get("host") || undefined }),
    [searchParams.toString()],
  );

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
            host,
          }),
        );

        if (isGoBack) {
          navigate(-1);
        } else {
          dispatch(closePopup()).then(() => navigate(Paths.HOME));
        }
      } catch (err) {
        setError("root", { type: "submit", message: (err as Error).message });
      }
    },
    [ethWallet.address, ethWallet.provider, cryptKeeperWallet.address, isGoBack, host, dispatch, navigate],
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
    await ethWallet.onConnect().catch(() => setError("root", { type: "submit", message: "Wallet connection error" }));
  }, [setError, ethWallet.onConnect]);

  const closeModal = useCallback(() => {
    if (isGoBack) {
      navigate(-1);
    } else {
      dispatch(closePopup());
    }
  }, [isGoBack, navigate, dispatch]);

  return {
    isLoading: ethWallet.isActivating || cryptKeeperWallet.isActivating || isLoading || isSubmitting,
    isWalletInstalled: ethWallet.isInjectedWallet,
    isWalletConnected: ethWallet.isActive,
    isProviderAvailable: values.identityStrategyType.value === "interrep",
    errors: {
      web2Provider: errors.web2Provider?.message,
      identityStrategyType: errors.identityStrategyType?.message,
      nonce: errors.nonce?.message,
      root: errors.root?.message,
    },
    control,
    host,
    closeModal,
    register,
    onConnectWallet: handleSubmit(onConnectWallet),
    onCreateWithEthWallet: handleSubmit(onCreateIdentityWithEthWallet),
    onCreateWithCryptkeeper: handleSubmit(onCreateIdentityWithCryptkeeper),
  };
};
