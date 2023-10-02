import { EWallet } from "@cryptkeeperzk/types";
import { useCallback, useMemo } from "react";
import { Control, useForm, UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { createIdentity } from "@src/ui/ducks/identities";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { getMessageTemplate, signWithSigner } from "@src/ui/services/identity";

export interface IUseCreateIdentityData {
  isLoading: boolean;
  isWalletConnected: boolean;
  isWalletInstalled: boolean;
  errors: Partial<{
    root: string;
    nonce: string;
  }>;
  control: Control<FormFields, unknown>;
  host?: string;
  onCloseModal: () => void;
  register: UseFormRegister<FormFields>;
  onSign: (index: number) => void;
}

interface FormFields {
  nonce: number;
  isDeterministic: boolean;
}

export enum SignatureOptions {
  CRYPTKEEPER_WALLET = 0,
  ETH_WALLET = 1,
}

export const useCreateIdentity = (): IUseCreateIdentityData => {
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
  const navigate = useNavigate();

  const { searchParams } = new URL(window.location.href.replace("#", ""));
  const { isGoBack, host } = useMemo(
    () => ({ isGoBack: searchParams.get("back") === "true", host: searchParams.get("host") || undefined }),
    [searchParams.toString()],
  );

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
            host,
          }),
        );

        if (isGoBack) {
          navigate(-1);
        } else {
          dispatch(closePopup()).then(() => {
            navigate(Paths.HOME);
          });
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
    await ethWallet.onConnect().catch(() => {
      setError("root", { type: "submit", message: "Wallet connection error" });
    });
  }, [setError, ethWallet.onConnect]);

  const onSign = useCallback(
    (index: number) => {
      const option = index as SignatureOptions;

      switch (true) {
        case option === SignatureOptions.CRYPTKEEPER_WALLET:
          return handleSubmit(onCreateIdentityWithCryptkeeper)();
        case option === SignatureOptions.ETH_WALLET && !ethWallet.isActive:
          return handleSubmit(onConnectWallet)();
        case option === SignatureOptions.ETH_WALLET && ethWallet.isActive:
          return handleSubmit(onCreateIdentityWithEthWallet)();

        default:
          return undefined;
      }
    },
    [ethWallet.isActive, handleSubmit, onConnectWallet, onCreateIdentityWithEthWallet, onCreateIdentityWithCryptkeeper],
  );

  const onCloseModal = useCallback(() => {
    if (isGoBack) {
      navigate(-1);
    } else {
      dispatch(closePopup()).then(() => {
        navigate(Paths.HOME);
      });
    }
  }, [isGoBack, navigate, dispatch]);

  return {
    isLoading: ethWallet.isActivating || cryptKeeperWallet.isActivating || isLoading || isSubmitting,
    isWalletInstalled: ethWallet.isInjectedWallet,
    isWalletConnected: ethWallet.isActive,
    errors: {
      nonce: errors.nonce?.message,
      root: errors.root?.message,
    },
    control,
    host,
    register,
    onCloseModal,
    onSign,
  };
};
