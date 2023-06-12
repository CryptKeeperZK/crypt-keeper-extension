import Box, { BoxProps } from "@mui/material/Box";

import localhostIcon from "@src/static/icons/localhost.svg";

export interface ISiteFaviconProps {
  src: string;
}

export const SiteFavicon = ({ src, ...rest }: ISiteFaviconProps & BoxProps): JSX.Element => (
  <Box
    alt="site favicon"
    component="img"
    src={src || localhostIcon}
    sx={{
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "text.secondary",
      borderRadius: "50%",
      mx: 2,
      my: 3,
      height: 64,
      width: 64,
      ...rest.sx,
    }}
    {...rest}
  />
);
