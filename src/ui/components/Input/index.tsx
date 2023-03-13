import classNames from "classnames";
import { InputHTMLAttributes, MouseEventHandler } from "react";

import { Icon } from "../Icon";

import "./input.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
  fontAwesome?: string;
  url?: string;
  onIconClick?: MouseEventHandler;
}

export const Input = ({
  fontAwesome,
  url,
  size = 1,
  onIconClick,
  label,
  errorMessage,
  className,
  ...inputProps
}: InputProps): JSX.Element => (
  <div className={classNames("input-group", className)}>
    {label && <div className="input-group__label">{label}</div>}

    <div className="input-group__group">
      <input
        className={classNames("input", {
          "input--full-width": !url && !fontAwesome,
        })}
        title={label}
        {...inputProps}
      />

      {(!!url || !!fontAwesome) && <Icon fontAwesome={fontAwesome} size={size} url={url} onClick={onIconClick} />}
    </div>

    {errorMessage && <div className="input-group__error-message">{errorMessage}</div>}
  </div>
);

Input.defaultProps = {
  label: "",
  errorMessage: "",
  fontAwesome: "",
  url: "",
  onIconClick: undefined,
};
