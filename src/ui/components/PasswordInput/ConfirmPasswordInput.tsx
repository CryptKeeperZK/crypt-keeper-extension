import { forwardRef, InputHTMLAttributes, Ref } from "react";

import { Input } from "../Input";

import "./passwordInput.scss";

interface ConfirmPasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isShowPassword: boolean;
  errorMessage?: string;
}

const ConfirmPasswordInputUI = (
  { isShowPassword, errorMessage = undefined, ...passwordInputProps }: ConfirmPasswordInputProps,
  inputRef: Ref<HTMLInputElement>,
): JSX.Element => (
  <Input
    errorMessage={errorMessage}
    id="confirmPassword"
    inputRef={inputRef}
    label="Confirm Password"
    type={isShowPassword ? "text" : "password"}
    {...passwordInputProps}
  />
);

export const ConfirmPasswordInput = forwardRef<HTMLInputElement, ConfirmPasswordInputProps>(ConfirmPasswordInputUI);
