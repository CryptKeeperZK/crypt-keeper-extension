import { EventName } from "@cryptkeeperzk/providers";
import { calculateIdentityCommitment, calculateIdentitySecret } from "@cryptkeeperzk/zk";
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
import { redirectToNewTab } from "@src/util/browser";
import { checkBigNumber, convertFromHexToDec } from "@src/util/numbers";

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
  onSubmit: () => void;
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
    register,
    watch,
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

  const onSubmit = useCallback(
    (data: FormFields) => {
      dispatch(importIdentity({ ...data, urlOrigin }))
        .then(() => {
          if (redirectUrl) {
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
    [redirectUrl, urlOrigin, setError, dispatch],
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
    onSubmit: handleSubmit(onSubmit),
  };
};
