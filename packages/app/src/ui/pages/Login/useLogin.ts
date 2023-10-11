import { BaseSyntheticEvent, useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { PasswordFormFields } from "@src/types";
import { closePopup, fetchStatus, unlock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchPendingRequests } from "@src/ui/ducks/requests";

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
      try {
        await dispatch(unlock(data.password));
        const requests = await dispatch(fetchPendingRequests());
        await dispatch(fetchStatus());

        if (requests.length === 0) {
          dispatch(closePopup());
        }

        navigate(Paths.HOME);
      } catch (error) {
        setError("password", { message: (error as Error).message });
      }
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
