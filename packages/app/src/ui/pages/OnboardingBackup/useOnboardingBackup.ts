import { BaseSyntheticEvent, useCallback, useState } from "react";
import { FileRejection } from "react-dropzone";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup, fetchStatus } from "@src/ui/ducks/app";
import { uploadBackup } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useCryptKeeperWallet } from "@src/ui/hooks/wallet";
import { readFile } from "@src/util/file";

import type { onDropCallback } from "@src/ui/components/UploadInput";

export interface IUseOnboardingBackupData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: { backupPassword?: string; backupFile?: string; root?: string };
  register: UseFormRegister<IOnboardingBackupFields>;
  onDrop: onDropCallback;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
  onGoBack: () => void;
}

interface IOnboardingBackupFields {
  backupPassword: string;
  backupFile: File;
}

export const useOnboardingBackup = (): IUseOnboardingBackupData => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { onConnect } = useCryptKeeperWallet();

  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    setValue,
    register,
    handleSubmit,
    clearErrors,
  } = useForm<IOnboardingBackupFields>({
    defaultValues: {
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
    dispatch(closePopup());
    navigate(Paths.ONBOARDING);
  }, [dispatch, navigate]);

  const onSubmit = useCallback(
    async (data: IOnboardingBackupFields) => {
      const content = await readFile(data.backupFile)
        .then((res) => {
          const text = res.target?.result;

          if (!text) {
            setError("root", { message: "Backup file is empty" });
          }

          return text?.toString();
        })
        .catch((error: Error) => setError("root", { message: error.message }));

      if (!content) {
        return;
      }

      dispatch(uploadBackup({ password: "", backupPassword: data.backupPassword, content }))
        .then(() => onConnect())
        .then(() => dispatch(fetchStatus()))
        .then(() => dispatch(closePopup()))
        .then(() => navigate(Paths.HOME))
        .catch((error: Error) => setError("root", { message: error.message }));
    },
    [dispatch, navigate, setError, onConnect],
  );

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isLoading: isLoading || isSubmitting,
    isShowPassword,
    errors: {
      backupPassword: errors.backupPassword?.message,
      backupFile: errors.backupFile?.message,
      root: errors.root?.message,
    },
    register,
    onDrop,
    onSubmit: handleSubmit(onSubmit),
    onShowPassword,
    onGoBack,
  };
};
