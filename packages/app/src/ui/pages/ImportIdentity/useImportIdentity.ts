import { EventName } from "@cryptkeeperzk/providers";
import { calculateIdentityCommitment, calculateIdentitySecret } from "@cryptkeeperzk/zk";
import { useCallback, useMemo } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";

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

export const useImportIdentity = (): IUseImportIdentityData => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const urlOrigin = useSearchParam("urlOrigin");
  const trapdoorUrlParam = useSearchParam("trapdoor");
  const nullifierUrlParam = useSearchParam("nullifier");

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
  });

  const [trapdoor, nullifier] = watch(["trapdoor", "nullifier"]);
  const secret = useMemo(() => calculateIdentitySecret({ trapdoor, nullifier }), [trapdoor, nullifier]);
  const commitment = useMemo(() => calculateIdentityCommitment(secret), [secret]);

  const onGoBack = useCallback(() => {
    dispatch(rejectUserRequest({ type: EventName.IMPORT_IDENTITY }, urlOrigin))
      .then(() => dispatch(closePopup()))
      .then(() => {
        navigate(Paths.HOME);
      });
  }, [urlOrigin, dispatch, navigate]);

  const onGoToHost = useCallback(() => {
    redirectToNewTab(urlOrigin!);
  }, [urlOrigin]);

  const onSubmit = useCallback(() => {
    setError("root", { message: "not implemented" });
  }, [setError]);

  return {
    isLoading: isSubmitting || isLoading,
    errors: {
      root: errors.root?.message,
      name: errors.name?.message,
      trapdoor: errors.trapdoor?.message,
      nullifier: errors.nullifier?.message,
    },
    urlOrigin,
    trapdoor,
    nullifier,
    secret,
    commitment,
    register,
    onGoBack,
    onGoToHost,
    onSubmit: handleSubmit(onSubmit),
  };
};
