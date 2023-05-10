import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { generateMnemonic } from "@src/background/services/mnemonic";
import { Paths } from "@src/constants";
import { saveMnemonic, useAppStatus } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseMnemonicData {
  isLoading: boolean;
  error: string;
  mnemonic: string;
  onSaveMnemonic: () => void;
}

export const useMnemonic = (): IUseMnemonicData => {
  const { isMnemonicGenerated } = useAppStatus();

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mnemonic = useMemo(() => generateMnemonic(), []);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSaveMnemonic = useCallback(() => {
    setLoading(true);
    dispatch(saveMnemonic(mnemonic))
      .then(() => navigate(Paths.HOME))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mnemonic, navigate, setLoading]);

  useEffect(() => {
    if (isMnemonicGenerated) {
      navigate(Paths.HOME);
    }
  }, [isMnemonicGenerated, navigate]);

  return {
    isLoading,
    error,
    mnemonic,
    onSaveMnemonic,
  };
};
