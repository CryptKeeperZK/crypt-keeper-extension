import { EventName } from "@cryptkeeperzk/providers";
import { EWallet } from "@cryptkeeperzk/types";
import { calculateIdentityCommitment, calculateIdentitySecret } from "@cryptkeeperzk/zk";
import get from "lodash/get";
import { useCallback, useMemo } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { importIdentity } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { useValidationResolver } from "@src/ui/hooks/validation";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";
import { getImportMessageTemplate, signWithSigner } from "@src/ui/services/identity";
import { redirectToNewTab } from "@src/util/browser";
import { readFile } from "@src/util/file";
import { checkBigNumber, convertFromHexToDec } from "@src/util/numbers";

import type { onDropCallback } from "@src/ui/components/UploadButton";
import type { FileRejection } from "react-dropzone";

export interface IUseImportIdentityData {
  isLoading: boolean;
  errors: Partial<{
    name: string;
    trapdoor: string;
    nullifier: string;
    root: string;
  }>;
  trapdoor: string;
  nullifier: string;
  secret: string;
  commitment: string;
  urlOrigin?: string;
  register: UseFormRegister<FormFields>;
  onGoBack: () => void;
  onGoToHost: () => void;
  onDrop: onDropCallback;
  onSubmit: (option: number) => void;
}

interface FormFields {
  name: string;
  trapdoor: string;
  nullifier: string;
}

const REDIRECT_MAP: Record<string, string> = {
  [Paths.CONNECT_IDENTITY]: Paths.CONNECT_IDENTITY,
  [Paths.CREATE_IDENTITY]: Paths.CREATE_IDENTITY,
};

const validationSchema = object({
  name: string().required("Name is required"),
  trapdoor: string()
    .transform(convertFromHexToDec)
    .test("trapdoor-bignumber", "Trapdoor is not a number", checkBigNumber)
    .required("Identity trapdoor is required"),
  nullifier: string()
    .transform(convertFromHexToDec)
    .test("nullifier-bignumber", "Nullifier is not a number", checkBigNumber)
    .required("Identity nullifier is required"),
});

export const useImportIdentity = (): IUseImportIdentityData => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const ethWallet = useEthWallet();
  const cryptKeeperWallet = useCryptKeeperWallet();

  const back = useSearchParam("back");
  const urlOrigin = useSearchParam("urlOrigin");
  const trapdoorUrlParam = useSearchParam("trapdoor");
  const nullifierUrlParam = useSearchParam("nullifier");
  const redirect = REDIRECT_MAP[back!];
  const redirectUrl = redirect ? `${redirect}?urlOrigin=${urlOrigin}&back=${back}` : redirect;

  const resolver = useValidationResolver(validationSchema);
  const {
    formState: { isSubmitting, isLoading, errors },
    setError,
    setValue,
    register,
    watch,
    clearErrors,
    handleSubmit,
  } = useForm({
    defaultValues: {
      name: "",
      trapdoor: trapdoorUrlParam || "",
      nullifier: nullifierUrlParam || "",
    },
    resolver,
  });

  const [trapdoor, nullifier] = watch(["trapdoor", "nullifier"]);
  const secret = useMemo(
    () =>
      checkBigNumber(trapdoor) && checkBigNumber(nullifier) ? calculateIdentitySecret({ trapdoor, nullifier }) : "",
    [trapdoor, nullifier],
  );
  const commitment = useMemo(() => calculateIdentityCommitment(secret), [secret]);

  const onGoBack = useCallback(() => {
    dispatch(rejectUserRequest({ type: EventName.IMPORT_IDENTITY }, urlOrigin)).then(() => {
      if (redirect) {
        navigate(-1);
      } else {
        dispatch(closePopup()).then(() => {
          navigate(Paths.HOME);
        });
      }
    });
  }, [redirect, urlOrigin, dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(urlOrigin!);
  }, [urlOrigin]);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles[0]) {
        setError("root", { message: rejectedFiles[0].errors[0].message });
        return;
      }

      clearErrors();
      await readFile(acceptedFiles[0])
        .then((res) => {
          const text = res.target?.result;

          if (!text) {
            setError("root", { message: "File is empty" });
          }

          return text?.toString();
        })
        .then((content?: string) => {
          if (!content) {
            return;
          }

          const parsed = JSON.parse(content) as
            | Partial<{ trapdoor: string; nullifier: string; _trapdoor: string; _nullifier: string }>
            | [string, string];

          if (Array.isArray(parsed)) {
            setValue("trapdoor", parsed[0]);
            setValue("nullifier", parsed[1]);
            return;
          }

          setValue("trapdoor", get(parsed, "trapdoor", "") || get(parsed, "_trapdoor", ""));
          setValue("nullifier", get(parsed, "nullifier", "") || get(parsed, "_nullifier", ""));
        })
        .catch((error: Error) => {
          setError("root", { message: error.message });
        });
    },
    [setValue, setError, clearErrors],
  );

  const importNewIdentity = useCallback(
    async (data: FormFields, walletType: EWallet) => {
      const account =
        walletType === EWallet.ETH_WALLET ? ethWallet.address?.toLowerCase() : cryptKeeperWallet.address?.toLowerCase();
      const message = getImportMessageTemplate({
        trapdoor: data.trapdoor,
        nullifier: data.nullifier,
        account: account!,
      });

      const messageSignature =
        walletType === EWallet.ETH_WALLET
          ? await signWithSigner({ signer: await ethWallet.provider?.getSigner(), message }).catch((error: Error) => {
              setError("root", { message: error.message });
            })
          : "";

      if (messageSignature === undefined) {
        return;
      }

      dispatch(importIdentity({ ...data, messageSignature, urlOrigin }))
        .then(() => {
          if (redirect === Paths.CREATE_IDENTITY.toString()) {
            navigate(Paths.HOME);
          } else if (redirectUrl) {
            navigate(redirectUrl);
          } else {
            dispatch(closePopup()).then(() => {
              navigate(Paths.HOME);
            });
          }
        })
        .catch((error: Error) => {
          setError("root", { message: error.message });
        });
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

  const onImportIdentityWithEthWallet = useCallback(
    async (data: FormFields) => importNewIdentity(data, EWallet.ETH_WALLET),
    [ethWallet.isActive, importNewIdentity],
  );

  const onImportIdentityWithCryptkeeper = useCallback(
    async (data: FormFields) => importNewIdentity(data, EWallet.CRYPTKEEPER_WALLET),
    [cryptKeeperWallet.isActive, importNewIdentity],
  );

  const onConnectWallet = useCallback(async () => {
    await ethWallet.onConnect().catch(() => {
      setError("root", { type: "submit", message: "Wallet connection error" });
    });
  }, [setError, ethWallet.onConnect]);

  const onSubmit = useCallback(
    (index: number) => {
      const option = index as EWallet;

      switch (true) {
        case option === EWallet.CRYPTKEEPER_WALLET:
          return handleSubmit(onImportIdentityWithCryptkeeper)();
        case option === EWallet.ETH_WALLET && !ethWallet.isActive:
          return handleSubmit(onConnectWallet)();
        case option === EWallet.ETH_WALLET && ethWallet.isActive:
          return handleSubmit(onImportIdentityWithEthWallet)();

        default:
          return undefined;
      }
    },
    [ethWallet.isActive, handleSubmit, onConnectWallet, onImportIdentityWithEthWallet, onImportIdentityWithCryptkeeper],
  );

  return {
    isLoading: isSubmitting || isLoading,
    errors: {
      root: errors.root?.message,
      name: errors.name?.message,
      trapdoor: errors.trapdoor?.message,
      nullifier: errors.nullifier?.message,
    },
    urlOrigin,
    trapdoor: convertFromHexToDec(trapdoor),
    nullifier: convertFromHexToDec(nullifier),
    secret,
    commitment,
    register,
    onGoBack,
    onGoToHost,
    onDrop,
    onSubmit,
  };
};
