import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";

import { Icon } from "@src/ui/components/Icon";

import loaderSvg from "../../../static/icons/loader.svg";

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
  className,
  loading,
  children,
  buttonType,
  small,
  tiny,
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
    disabled={disabled}
    type="button"
    {...buttonProps}
  >
    {loading && <Icon className="button__loader" size={2} url={loaderSvg} />}

    {!loading && children}
  </button>
);

Button.defaultProps = {
  className: "",
  buttonType: ButtonType.PRIMARY,
  loading: false,
  small: false,
  tiny: false,
};
