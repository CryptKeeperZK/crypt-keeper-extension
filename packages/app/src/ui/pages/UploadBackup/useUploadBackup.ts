import { BaseSyntheticEvent, useCallback, useState } from "react";
import { FileRejection } from "react-dropzone";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { uploadBackup } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useCryptKeeperWallet } from "@src/ui/hooks/wallet";
import { readFile } from "@src/util/file";

import type { onDropCallback } from "@src/ui/components/UploadInput";

export interface IUseUploadBackupData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: { password?: string; backupPassword?: string; backupFile?: string; root?: string };
  register: UseFormRegister<IUploadBackupFields>;
  onDrop: onDropCallback;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
  onGoBack: () => void;
}

interface IUploadBackupFields {
  password: string;
  backupPassword: string;
  backupFile: File;
}

export const useUploadBackup = (): IUseUploadBackupData => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { onConnect } = useCryptKeeperWallet();

  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    setValue,
    register,
    handleSubmit,
    clearErrors,
  } = useForm<IUploadBackupFields>({
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

  const onSubmit = useCallback(
    async (data: IUploadBackupFields) => {
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

      dispatch(uploadBackup({ password: data.password, backupPassword: data.backupPassword, content }))
        .then(() => onConnect())
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
      password: errors.password?.message,
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
