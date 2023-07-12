import { useCallback, useEffect, useState } from "react";
import { UseFormRegister, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { saveMnemonic, generateMnemonic, useAppStatus, useGeneratedMnemonic } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { mnemonicValidationSchema, useValidationResolver } from "@src/ui/hooks/validation";

export interface IUseGenerateMnemonicData {
  isLoading: boolean;
  errors: Partial<MnemonicFormFields>;
  register: UseFormRegister<MnemonicFormFields>;
  mode: EGenerateMnemonicMode;
  mnemonic: string;
  onSaveMnemonic: () => void;
  onChooseGenerateMode: () => void;
  onChooseInputMode: () => void;
}

export enum EGenerateMnemonicMode {
  GENERATE,
  INPUT,
}

interface MnemonicFormFields {
  mnemonic: string;
}

export const useGenerateMnemonic = (): IUseGenerateMnemonicData => {
  const resolver = useValidationResolver(mnemonicValidationSchema);
  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    setValue,
    register,
    watch,
    handleSubmit,
  } = useForm<MnemonicFormFields>({
    resolver,
    defaultValues: {
      mnemonic: "",
    },
  });

  const { isMnemonicGenerated } = useAppStatus();
  const generatedMnemonic = useGeneratedMnemonic();

  const [mode, setMode] = useState(EGenerateMnemonicMode.GENERATE);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSaveMnemonic = useCallback(
    (data: MnemonicFormFields) => {
      (mode === EGenerateMnemonicMode.INPUT ? dispatch(generateMnemonic(data.mnemonic)) : Promise.resolve())
        .then(() => dispatch(saveMnemonic()))
        .then(() => navigate(Paths.HOME))
        .catch((err: Error) => setError("mnemonic", { message: err.message }));
    },
    [generatedMnemonic, mode, navigate, dispatch, setError],
  );

  const onChooseGenerateMode = useCallback(() => {
    setMode(EGenerateMnemonicMode.GENERATE);
    setValue("mnemonic", generatedMnemonic as string);
  }, [generatedMnemonic, setMode, setValue]);

  const onChooseInputMode = useCallback(() => {
    setMode(EGenerateMnemonicMode.INPUT);
    setValue("mnemonic", "");
  }, [setMode, setValue]);

  useEffect(() => {
    if (isMnemonicGenerated) {
      navigate(Paths.HOME);
    } else if (!generatedMnemonic) {
      dispatch(generateMnemonic());
    } else {
      setValue("mnemonic", generatedMnemonic);
    }
  }, [isMnemonicGenerated, generatedMnemonic, setValue, navigate, dispatch]);

  return {
    isLoading: isLoading || isSubmitting,
    mode,
    mnemonic: watch("mnemonic"),
    errors: {
      mnemonic: errors.mnemonic?.message,
    },
    register,
    onSaveMnemonic: handleSubmit(onSaveMnemonic),
    onChooseGenerateMode,
    onChooseInputMode,
  };
};
