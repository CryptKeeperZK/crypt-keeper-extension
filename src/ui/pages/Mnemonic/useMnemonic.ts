import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { saveMnemonic, generateMnemonic, useAppStatus, useGeneratedMnemonic } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseMnemonicData {
  isLoading: boolean;
  error: string;
  mnemonic?: string;
  onSaveMnemonic: () => void;
}

export const useMnemonic = (): IUseMnemonicData => {
  const { isMnemonicGenerated } = useAppStatus();
  const mnemonic = useGeneratedMnemonic();

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSaveMnemonic = useCallback(() => {
    setLoading(true);
    dispatch(saveMnemonic())
      .then(() => navigate(Paths.HOME))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mnemonic, navigate, setLoading]);

  useEffect(() => {
    if (isMnemonicGenerated) {
      navigate(Paths.HOME);
    } else if (!mnemonic) {
      dispatch(generateMnemonic());
    }
  }, [isMnemonicGenerated, navigate, dispatch]);

  return {
    isLoading,
    error,
    mnemonic,
    onSaveMnemonic,
  };
};
