import { BaseSyntheticEvent, useCallback, useState } from "react";
import { useForm, UseFormRegister } from "react-hook-form";
import { object, ref, string } from "yup";

import { setupPassword } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useValidationResolver } from "@src/ui/hooks/validation";

export interface IUseOnboardingData {
  isLoading: boolean;
  errors: Partial<FormFields & { root: string }>;
  register: UseFormRegister<FormFields>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  eyeLook: boolean;
  onEyeLook: () => void;
  onEyeSlash: () => void;
}

interface FormFields {
  password: string;
  confirmPassword: string;
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
  const [eyeLook, setEyeLook] = useState(false);
  const resolver = useValidationResolver(validationSchema);
  const {
    formState: { isLoading, isSubmitting, errors },
    setError,
    register,
    handleSubmit,
  } = useForm<FormFields>({
    resolver,
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const dispatch = useAppDispatch();

  const onSubmit = useCallback(
    (data: FormFields) => {
      dispatch(setupPassword(data.password)).catch((err: Error) =>
        setError("root", { type: "submit", message: err.message }),
      );
    },
    [dispatch, setError],
  );

  const onEyeLook = useCallback(() => {
    setEyeLook(true);
  }, [eyeLook]);

  const onEyeSlash = useCallback(() => {
    setEyeLook(false);
  }, [eyeLook]);

  return {
    isLoading: isLoading || isSubmitting,
    errors: {
      password: errors.password?.message,
      confirmPassword: errors.confirmPassword?.message,
      root: errors.root?.message,
    },
    register,
    onSubmit: handleSubmit(onSubmit),
    eyeLook,
    onEyeLook,
    onEyeSlash,
  };
};
