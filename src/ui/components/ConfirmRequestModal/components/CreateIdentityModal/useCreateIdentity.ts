import { BaseSyntheticEvent, useCallback, useEffect, useState, MouseEvent as ReactMouseEvent } from "react";
import { Control, useForm, UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { getEnabledFeatures } from "@src/config/features";
import { WEB2_PROVIDER_OPTIONS, IDENTITY_TYPES, Paths } from "@src/constants";
import {
  EWallet,
  IdentityData,
  IdentityStrategy,
  IdentityWeb2Provider,
  PendingRequest,
  SelectOption,
} from "@src/types";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  createIdentity,
  fetchHostIdentities,
  fetchRandomIdentities,
  useIdentityHost,
  useRandomIdentities,
} from "@src/ui/ducks/identities";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { getMessageTemplate, signWithSigner } from "@src/ui/services/identity";
import { getLinkPreview } from "link-preview-js";

export interface IUseConnectionIdentityModalArgs {
  pendingRequest?: PendingRequest<{ host: string }>;
  accept?: () => void;
  reject?: () => void;
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
  host?: string;
  faviconUrl: string;
  randomIdentities: IdentityData[];
  isWalletModalOpen: boolean;
  closeModal: () => void;
  onAccept: () => void;
  onReject: () => void;
  onWalletModalShow: (event: ReactMouseEvent) => void;
  register: UseFormRegister<FormFields>;
  onConnectWallet: () => Promise<void>;
  onCreateWithEthWallet: (event?: BaseSyntheticEvent) => Promise<void>;
  onCreateWithCryptkeeper: (event?: BaseSyntheticEvent) => Promise<void>;
}

interface FormFields {
  identityStrategyType: SelectOption;
  web2Provider: SelectOption;
  nonce: number;
  host?: string;
}

export const useCreateIdentity = ({
  pendingRequest,
  accept,
  reject,
}: IUseConnectionIdentityModalArgs): IUseCreateIdentityData => {
  const [faviconUrl, setFaviconUrl] = useState("");
  const [isWalletModalOpen, setWalletModalOpen] = useState(false);
  const randomIdentities = useRandomIdentities();
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

  const ethWallet = useEthWallet();
  const cryptKeeperWallet = useCryptKeeperWallet();
  const dispatch = useAppDispatch();
  const values = watch();

  let host: string | undefined;

  if (pendingRequest) {
    const { payload } = pendingRequest;
    host = payload?.host ?? undefined;
  }

  const onWalletModalShow = useCallback(
    (event: ReactMouseEvent) => {
      event.stopPropagation();
      setWalletModalOpen((show) => !show);
    },
    [setWalletModalOpen],
  );

  const createNewIdentity = useCallback(
    async ({ identityStrategyType, web2Provider, nonce }: FormFields, walletType: EWallet) => {
      console.log(`host inside`, host);
      try {
        const account =
          walletType === EWallet.ETH_WALLET
            ? ethWallet.address?.toLowerCase()
            : cryptKeeperWallet.address?.toLowerCase();
        const message = getMessageTemplate({
          web2Provider: web2Provider.value as IdentityWeb2Provider,
          nonce,
          identityStrategyType: identityStrategyType.value as IdentityStrategy,
          account: account as string,
        });

        const options =
          identityStrategyType.value !== "random"
            ? {
                nonce,
                web2Provider: web2Provider.value as IdentityWeb2Provider,
                account: account as string,
                message,
              }
            : { message, account: account as string };

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
            host,
          }),
        );
        navigate(Paths.HOME);
      } catch (err) {
        setError("root", { type: "submit", message: (err as Error).message });
      }
    },
    [ethWallet.address, ethWallet.provider, cryptKeeperWallet.address, dispatch],
  );

  const onCreateIdentityWithEthWallet = useCallback(
    async (data: FormFields) => createNewIdentity(data, EWallet.ETH_WALLET),
    [ethWallet.isActive, createNewIdentity, setError],
  );

  const onCreateIdentityWithCryptkeeper = useCallback(
    async (data: FormFields) => createNewIdentity(data, EWallet.CRYPT_KEEPER_WALLET),
    [setError, createNewIdentity],
  );

  const onConnectWallet = useCallback(async () => {
    await ethWallet.onConnect().catch(() => setError("root", { type: "submit", message: "Wallet connection error" }));
  }, [setError, ethWallet.onConnect]);

  const closeModal = useCallback(() => {
    dispatch(closePopup());
  }, [dispatch]);

  const onAccept = useCallback(() => {
    if (!accept) {
      throw new Error("Please set accept fun");
    }
    accept();
  }, [accept]);

  const onReject = useCallback(() => {
    if (!reject) {
      throw new Error("Please set accept fun");
    }
    reject();
  }, [reject]);

  useEffect(() => {
    if (!host) {
      return;
    }

    getLinkPreview(host).then((data) => {
      const [favicon] = data.favicons;
      setFaviconUrl(favicon);
    });

    dispatch(fetchRandomIdentities());
  }, [dispatch]);

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
    randomIdentities,
    faviconUrl,
    isWalletModalOpen,
    closeModal,
    onAccept,
    onReject,
    onWalletModalShow,
    register,
    onConnectWallet: handleSubmit(onConnectWallet),
    onCreateWithEthWallet: handleSubmit(onCreateIdentityWithEthWallet),
    onCreateWithCryptkeeper: handleSubmit(onCreateIdentityWithCryptkeeper),
  };
};
