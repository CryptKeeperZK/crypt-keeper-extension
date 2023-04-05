import { useState } from "react";

export interface IUseShowPassword {
  isShowPassword: boolean;
  setShowPassword: () => void;
}

export const useShowPassword = (): IUseShowPassword => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const setShowPassword = () => {
    setIsShowPassword((isShow) => !isShow);
  };

  return {
    isShowPassword,
    setShowPassword,
  };
};
