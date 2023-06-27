import { useCallback } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";

import { validateMnemonic } from "@src/background/services/mnemonic";
import { useValidationResolver } from "@src/ui/hooks/validation";

export interface IUseRecoverData {
  isLoading: boolean;
  errors: Partial<RestoreFormFields & { root: string }>;
  register: UseFormRegister<RestoreFormFields>;
  onSubmit: () => Promise<void>;
  onClose: () => void;
}

interface RestoreFormFields {
  mnemonic: string;
}

const validationSchema = object({
  mnemonic: string()
    .test("mnemonic-validate", "Mnemonic is invalid", (mnemonic?: string) =>
      mnemonic ? validateMnemonic(mnemonic) : false,
    )
    .required("Mnemonic is required"),
});

export const useRecover = (): IUseRecoverData => {
  const navigate = useNavigate();
  const resolver = useValidationResolver(validationSchema);
  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<RestoreFormFields>({
    resolver,
    defaultValues: {
      mnemonic: "",
    },
  });

  const onRecover = useCallback(() => {
    setError("root", { message: "implement" });
  }, [setError]);

  const onClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    isLoading: isLoading || isSubmitting,
    errors: {
      mnemonic: errors.mnemonic?.message,
      root: errors.root?.message,
    },
    register,
    onSubmit: handleSubmit(onRecover),
    onClose,
  };
};
