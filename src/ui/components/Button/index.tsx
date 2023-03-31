import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";

import loaderSvg from "@src/static/icons/loader.svg";
import { Icon } from "@src/ui/components/Icon";

import "./button.scss";

export enum ButtonType {
  PRIMARY,
  SECONDARY,
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  loading?: boolean;
  buttonType?: ButtonType;
  small?: boolean;
  tiny?: boolean;
}

export const Button = ({
  className = "",
  loading = false,
  children,
  buttonType = ButtonType.PRIMARY,
  small = false,
  tiny = false,
  disabled,
  ...buttonProps
}: ButtonProps): JSX.Element => (
  <button
    className={classNames("button", className, {
      "button--small": small,
      "button--tiny": tiny,
      "button--loading": loading,
      "button--primary": buttonType === ButtonType.PRIMARY,
      "button--secondary": buttonType === ButtonType.SECONDARY,
    })}
    disabled={disabled || loading}
    type="button"
    {...buttonProps}
  >
    {loading && <Icon className="button__loader" size={2} url={loaderSvg} />}

    {!loading && children}
  </button>
);
