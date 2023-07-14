import { BaseSyntheticEvent, useCallback, useState } from "react";
import { FileRejection } from "react-dropzone";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import type { onDropCallback } from "@src/ui/components/UploadInput";

export interface IUseUploadBackupData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: { password?: string; backupPassword?: string; backupFile?: string };
  register: UseFormRegister<UploadBackupFields>;
  onDrop: onDropCallback;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
  onGoBack: () => void;
}

interface UploadBackupFields {
  password: string;
  backupPassword: string;
  backupFile: File;
}

export const useUploadBackup = (): IUseUploadBackupData => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    setValue,
    register,
    handleSubmit,
    clearErrors,
  } = useForm<UploadBackupFields>({
    defaultValues: {
      password: "",
      backupPassword: "",
      backupFile: undefined,
    },
  });

  const onDrop = useCallback(
    ([acceptedFile]: File[], [rejectedFile]: FileRejection[]) => {
      setValue("backupFile", acceptedFile);

      if (rejectedFile) {
        setError("backupFile", { message: rejectedFile.errors[0].message });
      } else {
        clearErrors();
      }
    },
    [setValue, setError, clearErrors],
  );

  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const onGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onSubmit = useCallback(() => {
    // TODO: implement
  }, [dispatch, onGoBack, setError]);

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isLoading: isLoading || isSubmitting,
    isShowPassword,
    errors: {
      password: errors.password?.message,
      backupPassword: errors.backupPassword?.message,
      backupFile: errors.backupFile?.message,
    },
    register,
    onDrop,
    onSubmit: handleSubmit(onSubmit),
    onShowPassword,
    onGoBack,
  };
};
