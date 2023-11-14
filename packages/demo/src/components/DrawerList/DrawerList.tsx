import { createSvgIcon } from "@mui/material";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import useTheme from "@mui/styles/useTheme";

import ListBox from "@src/components/ListBox";
import { DEMO, GETTING_STARTED, REFERENCES } from "@src/constants/lists";
import LogoSvg from "@src/static/icons/logo.svg";
import { useGlobalStyles } from "@src/styles/useGlobalStyles";

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
