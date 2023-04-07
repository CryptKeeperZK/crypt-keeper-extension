import { useCallback, useState } from "react";

export interface IUsePasswordInput {
  isShowPassword: boolean;
  onShowPassword: () => void;
}

export const usePasswordInput = (): IUsePasswordInput => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isShowPassword,
    onShowPassword,
  };
};
