import { ChangeEvent, FormEvent, useCallback, useState } from "react";

import { unlock } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface IUseLoginData {
  password: string;
  error: string;
  isLoading: boolean;
  onChangePassword: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const useLogin = (): IUseLoginData => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  const onChangePassword = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value),
    [setPassword],
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!password) {
        setError("Invalid password");
        return;
      }

      setIsLoading(true);

      dispatch(unlock(password))
        .catch((err: Error) => setError(err.message))
        .finally(() => setIsLoading(false));
    },
    [password, dispatch, setError, setIsLoading],
  );

  return {
    password,
    error,
    isLoading,
    onChangePassword,
    onSubmit,
  };
};
