import classNames from "classnames";
import { forwardRef, MouseEventHandler, Ref } from "react";

import "./icon.scss";

export interface IconProps {
  url?: string;
  fontAwesome?: string;
  className?: string;
  size?: number;
  disabled?: boolean;
  onClick?: MouseEventHandler;
}

const IconUI = (
  {
    url = "",
    size = 0.75,
    className = "",
    disabled = false,
    fontAwesome = "",
    onClick = undefined,
    ...rest
  }: IconProps,
  ref: Ref<HTMLDivElement>,
): JSX.Element => (
  <div
    ref={ref}
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

export const Icon = forwardRef(IconUI);
