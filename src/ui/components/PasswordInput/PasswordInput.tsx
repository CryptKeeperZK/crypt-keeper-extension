import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import { UseFormRegister } from "react-hook-form";

import { PasswordFormFields } from "@src/types";
import { usePasswordInput } from "@src/ui/components/PasswordInput/usePasswordInput";

import { Icon } from "../Icon";
import { Input } from "../Input";

import "./password-input.scss";

export interface PasswordInputProps {
  isShowInfo: boolean;
  isShowConfirmPassword: boolean;
  errors: Partial<PasswordFormFields & { root: string }>;
  register: UseFormRegister<PasswordFormFields>;
}

export const PasswordInput = ({
  isShowInfo,
  isShowConfirmPassword,
  errors,
  register,
}: PasswordInputProps): JSX.Element => {
  const { isShowPassword, onShowPassword } = usePasswordInput();

  return (
    <div className="py-4 w-full password-input" data-testid="showen-inputs">
      <Input
        autoFocus
        className="mb-4 password-input__content"
        endAdornment={
          <InputAdornment position="end">
            {isShowInfo ? (
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
        errorMessage={errors.password}
        id="password"
        label="Password"
        type={isShowPassword ? "text" : "password"}
        {...register("password")}
      />

      {isShowConfirmPassword ? (
        <Input
          errorMessage={errors.confirmPassword}
          id="confirmPassword"
          label="Confirm Password"
          type={isShowPassword ? "text" : "password"}
          {...register("confirmPassword")}
        />
      ) : null}
    </div>
  );
};
