import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import useTheme from "@mui/styles/useTheme";

import ListBox from "@src/components/ListBox";
import { DEMO_LIST } from "@src/constants";
import { useGlobalStyles } from "@src/styles/useGlobalStyles";

export const DrawerList = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Box className={classes.drawerList}>
      <Toolbar className={classes.drawerToolbar} />

      <ListBox listComponents={DEMO_LIST} />
    </Box>
  );
};
