import { ChangeEvent, FormEvent, useCallback, useState } from "react";

import { setupPassword } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseOnboardingData {
  isValid: boolean;
  password: string;
  confirmPassword: string;
  error: string;
  isLoading: boolean;
  onChangePassword: (event: ChangeEvent<HTMLInputElement>) => void;
  onChangeConfirmPassword: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useOnboarding = (): IUseOnboardingData => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const isValid = !!password && password === confirmPassword;

  const onChangePassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [setPassword],
  );

  const onChangeConfirmPassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(event.target.value);
    },
    [setConfirmPassword],
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isValid) {
        setError("Invalid password");
        return;
      }

      setIsLoading(true);

      dispatch(setupPassword(password))
        .catch((err: Error) => setError(err.message))
        .finally(() => setIsLoading(false));
    },
    [isValid, password, dispatch, setError, setIsLoading],
  );

  return {
    isValid,
    password,
    confirmPassword,
    error,
    isLoading,
    onChangePassword,
    onChangeConfirmPassword,
    onSubmit,
  };
};
