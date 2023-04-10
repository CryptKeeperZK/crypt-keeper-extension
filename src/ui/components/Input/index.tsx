import classNames from "classnames";
import { forwardRef, InputHTMLAttributes, Ref } from "react";

import "./input.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  endLabelIcon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  errorMessage?: string;
  inputRef?: Ref<HTMLInputElement>;
}

const InputUI = (
  {
    id,
    label,
    endLabelIcon = undefined,
    className,
    errorMessage = "",
    endAdornment = undefined,
    inputRef = undefined,
    ...inputProps
  }: InputProps,
  ref: Ref<HTMLInputElement>,
): JSX.Element => (
  <div className={classNames("input-group", className)}>
    {label && (
      <label className="input-group__label" htmlFor={id}>
        {label}

        {endLabelIcon && (
          <label className="input-group__label__end" htmlFor={id}>
            {endLabelIcon}
          </label>
        )}
      </label>
    )}

    <div className="input-group__group">
      <input
        ref={inputRef || ref}
        className={classNames("input", {
          "input--full-width": !endAdornment,
        })}
        id={id}
        title={label}
        {...inputProps}
      />

      {endAdornment}
    </div>

    <p className="input-group__error-message">{errorMessage}</p>
  </div>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(InputUI);
