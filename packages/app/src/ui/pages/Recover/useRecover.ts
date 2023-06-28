import { useCallback } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { object, string } from "yup";

import { validateMnemonic } from "@src/background/services/mnemonic";
import { Paths } from "@src/constants";
import { useValidationResolver } from "@src/ui/hooks/validation";

export interface IUseRecoverData {
  isLoading: boolean;
  errors: Partial<RestoreFormFields>;
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
    register,
    handleSubmit,
  } = useForm<RestoreFormFields>({
    resolver,
    defaultValues: {
      mnemonic: "",
    },
  });

  const onRecover = useCallback(
    (data: RestoreFormFields) => {
      // TODO: add mnemonic phrase check
      navigate(`${Paths.RESET_PASSWORD}?mnemonic=${data.mnemonic}`);
    },
    [navigate],
  );

  const onClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    isLoading: isLoading || isSubmitting,
    errors: {
      mnemonic: errors.mnemonic?.message,
    },
    register,
    onSubmit: handleSubmit(onRecover),
    onClose,
  };
};
