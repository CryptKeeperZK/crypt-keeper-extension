import { BaseSyntheticEvent, useCallback } from "react";
import { useForm, UseFormRegister } from "react-hook-form";

import { setupPassword } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseOnboardingData {
  isLoading: boolean;
  errors: Partial<FormFields & { root: string }>;
  register: UseFormRegister<FormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
}

interface FormFields {
  password: string;
  confirmPassword: string;
}

export const useOnboarding = (): IUseOnboardingData => {
  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<FormFields>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    (data: FormFields) => {
      dispatch(setupPassword(data.password)).catch((err: Error) =>
        setError("root", { type: "submit", message: err.message }),
      );
    },
    [dispatch, setError],
  );

  return {
    isLoading: isLoading || isSubmitting,
    errors: {
      password: errors.password?.message,
      confirmPassword: errors.confirmPassword?.message,
      root: errors.root?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
  };
};
