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
  errors: Partial<{
    root: string;
    nonce: string;
  }>;
  control: Control<FormFields, unknown>;
  urlOrigin?: string;
  onCloseModal: () => void;
  register: UseFormRegister<FormFields>;
  onSign: (index: number) => void;
  onGoToImportIdentity: () => void;
}

interface FormFields {
  nonce: number;
  isDeterministic: boolean;
}

export enum SignatureOptions {
  CRYPTKEEPER_WALLET = 0,
  ETH_WALLET = 1,
}

const REDIRECT_MAP: Record<string, string> = {
  [Paths.CONNECT_IDENTITY]: Paths.CONNECT_IDENTITY,
};

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
  const { redirect, urlOrigin } = useMemo(
    () => ({
      redirect: REDIRECT_MAP[searchParams.get("back")!],
      urlOrigin: searchParams.get("urlOrigin") || undefined,
    }),
    [searchParams.toString()],
  );
  const redirectUrl = redirect ? `${redirect}?urlOrigin=${urlOrigin}&back=${redirect}` : redirect;

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

        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          dispatch(closePopup()).then(() => {
            navigate(Paths.HOME);
          });
        }
      } catch (err) {
        setError("root", { type: "submit", message: (err as Error).message });
      }
    },
    [
      ethWallet.address,
      ethWallet.provider,
      cryptKeeperWallet.address,
      redirectUrl,
      urlOrigin,
      dispatch,
      navigate,
      setError,
    ],
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
    if (redirect) {
      navigate(-1);
    } else {
      dispatch(closePopup()).then(() => {
        navigate(Paths.HOME);
      });
    }
  }, [redirect, navigate, dispatch]);

  const onGoToImportIdentity = useCallback(() => {
    navigate(`${Paths.IMPORT_IDENTITY}?back=${redirect || Paths.CREATE_IDENTITY}&urlOrigin=${urlOrigin || ""}`);
  }, [redirect, urlOrigin, navigate]);

  return {
    isLoading: ethWallet.isActivating || cryptKeeperWallet.isActivating || isLoading || isSubmitting,
    errors: {
      nonce: errors.nonce?.message,
      root: errors.root?.message,
    },
    control,
    urlOrigin,
    register,
    onCloseModal,
    onSign,
    onGoToImportIdentity,
  };
};
