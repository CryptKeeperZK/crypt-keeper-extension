import { BaseSyntheticEvent, useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { PasswordFormFields } from "@src/types";
import { unlock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseLoginData {
  isLoading: boolean;
  errors: Partial<PasswordFormFields>;
  register: UseFormRegister<PasswordFormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  isShowPassword: boolean;
  onShowPassword: () => void;
}

export const useLogin = (): IUseLoginData => {
  const [isShowPassword, setIsShowPassword] = useState(false);

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

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    (data: PasswordFormFields) => {
      dispatch(unlock(data.password))
        .then(() => navigate(Paths.HOME))
        .catch((error: Error) => setError("password", { type: "submit", message: error.message }));
    },
    [dispatch, setError],
  );

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isLoading: isLoading || isSubmitting,
    errors: {
      password: errors.password?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
    isShowPassword,
    onShowPassword,
  };
};
