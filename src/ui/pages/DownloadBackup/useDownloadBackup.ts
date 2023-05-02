import { BaseSyntheticEvent, useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { PasswordFormFields } from "@src/types";
import { downloadBackup } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseDownloadBackupData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: Partial<DownloadBackupFields>;
  register: UseFormRegister<DownloadBackupFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
  onGoBack: () => void;
}

type DownloadBackupFields = Pick<PasswordFormFields, "password">;

export const useDownloadBackup = (): IUseDownloadBackupData => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<DownloadBackupFields>({
    defaultValues: {
      password: "",
    },
  });

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const onGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onSubmit = useCallback(
    (data: DownloadBackupFields) => {
      // TODO: implement file download
      dispatch(downloadBackup(data.password))
        .then(() => onGoBack())
        .catch((error: Error) => setError("password", { type: "submit", message: error.message }));
    },
    [dispatch, onGoBack, setError],
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
    onGoBack,
  };
};
