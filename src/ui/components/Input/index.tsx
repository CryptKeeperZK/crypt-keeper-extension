import classNames from "classnames";
import { forwardRef, InputHTMLAttributes, Ref } from "react";

import "./input.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errorMessage?: string;
}

const InputUI = (
  { id, label, className, errorMessage = "", ...inputProps }: InputProps,
  ref: Ref<HTMLInputElement>,
): JSX.Element => (
  <div className={classNames("input-group", className)}>
    {label && (
      <label className="input-group__label" htmlFor={id}>
        {label}
      </label>
    )}

    <div className="input-group__group">
      <input
        ref={ref}
        className={classNames("input", {
          "input--full-width": true,
        })}
        id={id}
        title={label}
        {...inputProps}
      />
    </div>

    <p className="input-group__error-message">{errorMessage}</p>
  </div>
);

export const Input = forwardRef<HTMLInputElement, InputProps>(InputUI);
