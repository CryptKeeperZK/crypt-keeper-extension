import { BaseSyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { PasswordFormFields } from "@src/types";
import { fetchStatus, unlock, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchPendingRequests, usePendingRequests } from "@src/ui/ducks/requests";

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
  const pendingRequests = usePendingRequests();
  const status = useAppStatus();
  const isKeepOpen = useMemo(() => pendingRequests.length > 0, [pendingRequests.length]);

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

  useEffect(() => {
    if (!status.isUnlocked) {
      return;
    }

    // TODO: I am not sure yet why is that is the cause for that bug:
    // (https://github.com/CryptKeeperZK/crypt-keeper-extension/issues/992)
    // When commented the bug was resolved.
    // I think because at that scenario described in the bug issue, the pendingRequests would be already zero.
    // if (!isKeepOpen) {
    //   dispatch(closePopup());
    // }

    navigate(Paths.HOME);
  }, [isKeepOpen, status.isUnlocked, dispatch]);

  const onSubmit = useCallback(
    async (data: LoginFields) => {
      await dispatch(unlock(data.password))
        .then(() => {
          dispatch(fetchStatus());
        })
        .then(() => {
          dispatch(fetchPendingRequests());
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
