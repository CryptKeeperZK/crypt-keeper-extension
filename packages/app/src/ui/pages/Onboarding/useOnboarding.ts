import { BaseSyntheticEvent, useCallback, useMemo, useState } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { object, ref, string } from "yup";

import { Paths } from "@src/constants";
import { PasswordFormFields } from "@src/types";
import { setupPassword } from "@src/ui/ducks/app";
import { createOnboardingBackupRequest } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { passwordRules, useValidationResolver } from "@src/ui/hooks/validation";

export interface IUseOnboardingData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: Partial<PasswordFormFields & { root: string }>;
  register: UseFormRegister<PasswordFormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
  onGoToOnboardingBackup: () => void;
}

const validationSchema = object({
  password: string().required("Password is required"),
  confirmPassword: string()
    .oneOf([ref("password"), ""], "Passwords must match")
    .required("Confirm your password"),
});

export const useOnboarding = (): IUseOnboardingData => {
  const [isShowPassword, setIsShowPassword] = useState(false);

  const resolver = useValidationResolver(validationSchema);
  const {
    formState: { isLoading, isSubmitting, isDirty, errors },
    setError,
    watch,
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
        .then(() => {
          navigate(Paths.GENERATE_MNEMONIC);
        })
        .catch((err: Error) => {
          setError("root", { type: "submit", message: err.message });
        });
    },
    [dispatch, navigate, setError],
  );

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  const onGoToOnboardingBackup = useCallback(() => {
    dispatch(createOnboardingBackupRequest()).then(() => {
      navigate(Paths.ONBOARDING_BACKUP);
    });
  }, [dispatch, navigate]);

  const password = watch("password");
  const isPasswordWeak = useMemo(() => !passwordRules.test(password), [password]);
  const weakPasswordError = isDirty && isPasswordWeak ? "Password is weak" : undefined;

  return {
    isLoading: isLoading || isSubmitting,
    isShowPassword,
    errors: {
      password: errors.password?.message || weakPasswordError,
      confirmPassword: errors.confirmPassword?.message,
      root: errors.root?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
    onShowPassword,
    onGoToOnboardingBackup,
  };
};
