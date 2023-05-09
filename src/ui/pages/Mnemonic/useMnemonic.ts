import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";

export interface IUseMnemonicData {
  mnemonic: string;
  onGoHome: () => void;
}

// TODO: update app status, generate mnemonic, save root key
export const useMnemonic = (): IUseMnemonicData => {
  const mnemonic = "test test test test test test test test test test test junk";

  const navigate = useNavigate();

  const onGoHome = useCallback(() => {
    navigate(Paths.HOME);
  }, [navigate]);

  return {
    mnemonic,
    onGoHome,
  };
};
