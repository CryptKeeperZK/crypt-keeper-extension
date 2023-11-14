import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";
import { forwardRef, MouseEventHandler, Ref } from "react";

import { useGlobalStyles } from "@src/styles";

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
): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Box
      ref={ref}
      {...rest}
      className={classes.icon}
      role="img"
      style={{
        backgroundImage: url ? `url(${url})` : undefined,
        width: `${size}rem`,
        height: `${size}rem`,
      }}
      onClick={onClick}
    />
  );
};

export const Icon = forwardRef(IconUI);
