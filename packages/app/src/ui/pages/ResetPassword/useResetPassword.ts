import { BaseSyntheticEvent, useCallback, useState } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { object, ref, string } from "yup";

import { Paths } from "@src/constants";
import { PasswordFormFields } from "@src/types";
import { useValidationResolver } from "@src/ui/hooks/validation";

export interface IUseResetPasswordData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: Partial<PasswordFormFields & { root: string }>;
  register: UseFormRegister<PasswordFormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
  onClose: () => void;
}

const passwordRules = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

const validationSchema = object({
  password: string()
    .matches(passwordRules, {
      message: "Password isn't strong",
    })
    .required("Password is required"),
  confirmPassword: string()
    .oneOf([ref("password"), ""], "Passwords must match")
    .required("Confirm your password"),
});

export const useResetPassword = (): IUseResetPasswordData => {
  const navigate = useNavigate();
  const [isShowPassword, setIsShowPassword] = useState(false);

  const resolver = useValidationResolver(validationSchema);
  const {
    formState: { isLoading, isSubmitting, errors },
    register,
    handleSubmit,
  } = useForm<PasswordFormFields>({
    resolver,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = useCallback(() => {
    navigate(Paths.HOME);
  }, [navigate]);

  const onClose = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isLoading: isLoading || isSubmitting,
    isShowPassword,
    errors: {
      password: errors.password?.message,
      confirmPassword: errors.confirmPassword?.message,
      root: errors.root?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
    onShowPassword,
    onClose,
  };
};
