import { BaseSyntheticEvent, useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { PasswordFormFields } from "@src/types";
import { closePopup, unlock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseLoginData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: Partial<LoginFields>;
  register: UseFormRegister<LoginFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
}

type LoginFields = Pick<PasswordFormFields, "password">;

export const useLogin = (): IUseLoginData => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<LoginFields>({
    defaultValues: {
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFields) => {
      await dispatch(unlock(data.password))
        .then(() => {
          navigate(Paths.HOME);
        })
        .then(() => {
          dispatch(closePopup());
        })
        .catch((error: Error) => {
          setError("password", { message: error.message });
        });
    },
    [dispatch, setError],
  );

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isLoading: isLoading || isSubmitting,
    isShowPassword,
    errors: {
      password: errors.password?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
    onShowPassword,
  };
};
