import { BaseSyntheticEvent, useCallback, useState } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { object, ref, string } from "yup";

import { Paths } from "@src/constants";
import { PasswordFormFields } from "@src/types";
import { setupPassword } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useValidationResolver } from "@src/ui/hooks/validation";

export interface IUseOnboardingData {
  isLoading: boolean;
  errors: Partial<PasswordFormFields & { root: string }>;
  register: UseFormRegister<PasswordFormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  isShowPassword: boolean;
  onShowPassword: () => void;
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

export const useOnboarding = (): IUseOnboardingData => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const resolver = useValidationResolver(validationSchema);
  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<PasswordFormFields>({
    resolver,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    (data: PasswordFormFields) => {
      dispatch(setupPassword(data.password))
        .then(() => navigate(Paths.MNEMONIC))
        .catch((err: Error) => setError("root", { type: "submit", message: err.message }));
    },
    [dispatch, navigate, setError],
  );

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  return {
    isLoading: isLoading || isSubmitting,
    errors: {
      password: errors.password?.message,
      confirmPassword: errors.confirmPassword?.message,
      root: errors.root?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
    isShowPassword,
    onShowPassword,
  };
};
