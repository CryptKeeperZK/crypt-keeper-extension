import { BaseSyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { object, ref, string } from "yup";

import { Paths } from "@src/constants";
import { PasswordFormFields } from "@src/types";
import { resetPassword } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { passwordRules, useValidationResolver } from "@src/ui/hooks/validation";

export interface IUseResetPasswordData {
  isLoading: boolean;
  isShowPassword: boolean;
  errors: Partial<PasswordFormFields & { root: string }>;
  register: UseFormRegister<PasswordFormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onShowPassword: () => void;
  onClose: () => void;
}

const validationSchema = object({
  password: string().required("Password is required"),
  confirmPassword: string()
    .oneOf([ref("password"), ""], "Passwords must match")
    .required("Confirm your password"),
});

export const useResetPassword = (): IUseResetPasswordData => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
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

  const mnemonic = searchParams.get("mnemonic")!;

  const onSubmit = useCallback(
    (data: PasswordFormFields) => {
      dispatch(resetPassword({ password: data.password, mnemonic }))
        .then(() => navigate(Paths.HOME))
        .catch((error: Error) => setError("root", { message: error.message }));
    },
    [mnemonic, setError, navigate, dispatch],
  );

  const onClose = useCallback(() => {
    navigate(Paths.RECOVER);
  }, [navigate]);

  const onShowPassword = useCallback(() => {
    setIsShowPassword((isShow) => !isShow);
  }, [setIsShowPassword]);

  useEffect(() => {
    if (!mnemonic) {
      navigate(Paths.HOME);
    }
  }, [mnemonic, navigate]);

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
    onClose,
  };
};
