import classNames from "classnames";
import { MouseEventHandler } from "react";

import "./icon.scss";

export interface IconProps {
  url?: string;
  fontAwesome?: string;
  className?: string;
  size?: number;
  disabled?: boolean;
  onClick?: MouseEventHandler;
}

export const Icon = ({
  url = "",
  size = 0.75,
  className = "",
  disabled = false,
  fontAwesome = "",
  onClick = undefined,
  ...rest
}: IconProps): JSX.Element => (
  <div
    {...rest}
    className={classNames("icon", className, {
      "icon--disabled": disabled,
      "icon--clickable": onClick,
    })}
    style={{
      backgroundImage: url ? `url(${url})` : undefined,
      width: !fontAwesome ? `${size}rem` : undefined,
      height: !fontAwesome ? `${size}rem` : undefined,
      fontSize: fontAwesome && `${size}rem`,
    }}
    onClick={onClick}
  >
    {fontAwesome && <i className={`fas ${fontAwesome}`} />}
  </div>
);
