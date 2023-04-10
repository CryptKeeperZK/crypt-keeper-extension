import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import { forwardRef, InputHTMLAttributes, Ref } from "react";

import { Icon } from "../Icon";
import { Input } from "../Input";

import "./passwordInput.scss";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  isShowHint: boolean;
  isShowPassword: boolean;
  isShowConfirmPassword?: boolean;
  onShowPassword: () => void;
  errorMessages: (string | undefined)[];
}

const PasswordInputUI = (
  {
    isShowHint,
    errorMessages,
    isShowPassword,
    isShowConfirmPassword = false,
    onShowPassword,
    ...passwordInputProps
  }: PasswordInputProps,
  ref: Ref<HTMLInputElement>,
): JSX.Element => (
  <div className="py-4 w-full password-input" data-testid="showen-inputs">
    <Input
      autoFocus
      className="mb-4 password-input__content"
      endAdornment={
        <InputAdornment position="end">
          {isShowHint ? (
            <Tooltip
              key={1}
              className="password-input__info-tooltip"
              title={
                <div>
                  <p>Password requirements:</p>

                  <p>- At least 8 characters</p>

                  <p>- At least 1 upper case and letter</p>

                  <p>- At least 1 lower case letter</p>

                  <p>- At least 1 special character (!@#$%^&*)</p>

                  <p>- At least 1 number</p>
                </div>
              }
            >
              <Icon className="password-input__info-icon" fontAwesome="fa-info" />
            </Tooltip>
          ) : null}

          {isShowPassword ? (
            <Tooltip
              key={2}
              className="eye-tooltip"
              data-testid="eye-slash-button"
              title="Hide Password"
              onClick={onShowPassword}
            >
              <Icon className="password-input__info-icon" fontAwesome="fa-eye-slash" />
            </Tooltip>
          ) : (
            <Tooltip
              key={2}
              className="eye-tooltip"
              data-testid="eye-look-button"
              title="Show Password"
              onClick={onShowPassword}
            >
              <Icon className="password-input__info-icon" fontAwesome="fa-eye" />
            </Tooltip>
          )}
        </InputAdornment>
      }
      errorMessage={errorMessages[0]}
      id="password"
      inputRef={ref}
      label="Password"
      type={isShowPassword ? "text" : "password"}
      {...Object.values(passwordInputProps)[0]}
    />

    {isShowConfirmPassword ? (
      <Input
        errorMessage={errorMessages[1]}
        id="confirmPassword"
        inputRef={ref}
        label="Confirm Password"
        type={isShowPassword ? "text" : "password"}
        {...Object.values(passwordInputProps)[1]}
      />
    ) : null}
  </div>
);

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(PasswordInputUI);
