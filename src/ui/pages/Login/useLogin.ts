import { BaseSyntheticEvent, useCallback } from "react";
import { UseFormRegister, useForm } from "react-hook-form";

import { unlock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { PasswordFormFields } from "@src/types";

export interface IUseLoginData {
  isLoading: boolean;
  errors: Partial<PasswordFormFields>;
  register: UseFormRegister<PasswordFormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
}

export const useLogin = (): IUseLoginData => {
  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<PasswordFormFields>({
    defaultValues: {
      password: "",
    },
  });

  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    (data: PasswordFormFields) => {
      dispatch(unlock(data.password)).catch((error: Error) =>
        setError("password", { type: "submit", message: error.message }),
      );
    },
    [dispatch, setError],
  );

  return {
    isLoading: isLoading || isSubmitting,
    errors: {
      password: errors.password?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
  };
};
