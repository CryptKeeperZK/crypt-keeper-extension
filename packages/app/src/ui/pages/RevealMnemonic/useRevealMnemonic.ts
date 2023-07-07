import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMnemonic } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseRevealMnemonicData {
  error: string;
  mnemonic: string;
  onGoBack: () => void;
}

export const useRevealMnemonic = (): IUseRevealMnemonicData => {
  const [mnemonic, setMnemonic] = useState("");

  const [error, setError] = useState("");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    dispatch(getMnemonic())
      .then((result: string) => setMnemonic(result))
      .catch((err: Error) => setError(err.message));
  }, [navigate, setMnemonic, setError, dispatch]);

  return {
    error,
    mnemonic,
    onGoBack,
  };
};
