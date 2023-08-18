import { BaseSyntheticEvent, useCallback, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { checkPassword, getMnemonic } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseRevealMnemonicData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: Partial<MnemonicFormFields & { root: string }>;
  mnemonic: string;
  onGoBack: () => void;
  register: UseFormRegister<MnemonicFormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
}

interface MnemonicFormFields {
  password: string;
}

export const useRevealMnemonic = (): IUseRevealMnemonicData => {
  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<MnemonicFormFields>({
    defaultValues: {
      password: "",
    },
  });

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [mnemonic, setMnemonic] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onCheckPassword = useCallback(
    (data: MnemonicFormFields) => {
      dispatch(checkPassword(data.password))
        .then(() => dispatch(getMnemonic()))
        .then((result: string) => setMnemonic(result))
        .catch((err: Error) => setError("root", { message: err.message }));
    },
    [dispatch, setMnemonic, setError],
  );

  const onGoBack = useCallback(() => {
    navigate(Paths.SETTINGS);
  }, [navigate]);

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isLoading: isLoading || isSubmitting,
    isShowPassword,
    errors: {
      password: errors.password?.message,
      root: errors.root?.message,
    },
    mnemonic,
    register,
    onShowPassword,
    onGoBack,
    onSubmit: handleSubmit(onCheckPassword),
  };
};
