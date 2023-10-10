import InputAdornment from "@mui/material/InputAdornment";
import { type TextFieldProps } from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import omit from "lodash/omit";
import { forwardRef, Ref } from "react";

import { Icon } from "../Icon";
import { Input } from "../Input";

import "./passwordInput.scss";

interface IPasswordInputProps extends TextFieldProps<"filled"> {
  id: string;
  label: string;
  isShowPassword: boolean;
  isShowEye?: boolean;
  isShowHint?: boolean;
  errorMessage?: string;
  onShowPassword: () => void;
}

const PasswordInputUI = (
  {
    id,
    label,
    isShowHint = false,
    errorMessage = undefined,
    isShowEye = false,
    isShowPassword,
    onShowPassword,
    ...passwordInputProps
  }: IPasswordInputProps,
  inputRef: Ref<HTMLInputElement>,
): JSX.Element => (
  <Input
    className="mb-4 password-input__content"
    endLabelIcon={
      isShowEye && (
        <InputAdornment className="password-input__adornment" position="end">
          {isShowPassword ? (
            <Tooltip key={2} className="eye-tooltip" title="Hide Password" onClick={onShowPassword}>
              <span className="password-input__info-icon">Hide</span>
            </Tooltip>
          ) : (
            <Tooltip key={2} className="eye-tooltip" title="Show Password" onClick={onShowPassword}>
              <span className="password-input__info-icon">Show</span>
            </Tooltip>
          )}
        </InputAdornment>
      )
    }
    errorMessage={errorMessage}
    id={id}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          {isShowHint && (
            <Tooltip
              key={1}
              className="password-input__info-tooltip"
              title={
                <div>
                  <p>Password requirements:</p>

                  <p>- At least 8 characters</p>

                  <p>- At least 1 upper case letter</p>

                  <p>- At least 1 lower case letter</p>

                  <p>- At least 1 special character</p>

                  <p>- At least 1 number</p>
                </div>
              }
            >
              <Icon className="password-input__info-icon" fontAwesome="fa-info" />
            </Tooltip>
          )}
        </InputAdornment>
      ),
    }}
    inputRef={inputRef}
    label={label}
    type={isShowPassword ? "text" : "password"}
    {...omit(passwordInputProps, ["ref"])}
  />
);

export const PasswordInput = forwardRef<HTMLInputElement, IPasswordInputProps>(PasswordInputUI);
