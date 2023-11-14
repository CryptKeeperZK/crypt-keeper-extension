import Box from "@mui/material/Box";
import SvgIcon from "@mui/material/SvgIcon";
import Toolbar from "@mui/material/Toolbar";
import useTheme from "@mui/styles/useTheme";

import ListBox from "@src/components/ListBox";
import { DEMO, GETTING_STARTED, REFERENCES } from "@src/constants/lists";
import { useGlobalStyles } from "@src/styles/useGlobalStyles";
import LogoSvg from "@src/static/icons/logo.svg";
import { useEffect } from "react";
import { createSvgIcon } from "@mui/material";
import { Icon } from "../Icon/Icon";

const CKIcon = createSvgIcon(LogoSvg, "CKIcon");

export const DrawerList = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Box className={classes.drawerList}>
      <Toolbar className={classes.drawerToolbar}>
        <Icon size={3} url={LogoSvg} />
      </Toolbar>

      <ListBox listComponents={GETTING_STARTED} />
      <ListBox listComponents={DEMO} />
      <ListBox listComponents={REFERENCES} />
    </Box>
  );
};
