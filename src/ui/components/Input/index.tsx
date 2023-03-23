import classNames from "classnames";
import { InputHTMLAttributes } from "react";

import "./input.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ id, label, className, ...inputProps }: InputProps): JSX.Element => (
  <div className={classNames("input-group", className)}>
    {label && (
      <label className="input-group__label" htmlFor={id}>
        {label}
      </label>
    )}

    <div className="input-group__group">
      <input
        className={classNames("input", {
          "input--full-width": true,
        })}
        id={id}
        title={label}
        {...inputProps}
      />
    </div>
  </div>
);

Input.defaultProps = {
  label: "",
};
