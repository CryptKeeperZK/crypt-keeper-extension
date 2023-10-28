import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/styles";
import { type PropsWithChildren } from "react";

import { useGlobalStyles } from "@src/styles";

export const RightSideBar = ({ children }: PropsWithChildren): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Drawer anchor="right" className={classes.rightSideBar} variant="permanent">
      {children}
    </Drawer>
  );
};
