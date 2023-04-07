import { useState } from "react";

export interface IUsePasswordInput {
  isShowPassword: boolean;
  setShowPassword: () => void;
}

export const usePasswordInput = (): IUsePasswordInput => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const setShowPassword = () => {
    setIsShowPassword((isShow) => !isShow);
  };

  return {
    isShowPassword,
    setShowPassword,
  };
};
