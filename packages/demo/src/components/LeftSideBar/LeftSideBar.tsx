import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/styles";

import { useGlobalStyles } from "@src/styles";
import { sharedStyles } from "@src/styles/useGlobalStyles";

import { DrawerList } from "../DrawerList/DrawerList";

interface ILeftSideBar {
  isMobileOpen: boolean;
  handleDrawerToggle: () => void;
}

export const LeftSideBar = ({ isMobileOpen, handleDrawerToggle }: ILeftSideBar): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const container = window.document.body;

  return (
    <Box
      className={classes.leftSideBar}
      component="nav"
      sx={{ width: { sm: sharedStyles.sideBarWidth }, flexShrink: { sm: 0 } }}
    >
      <Drawer
        anchor="left"
        className={classes.leftSideBarDrawer}
        container={container}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        open={isMobileOpen}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: sharedStyles.sideBarWidth },
        }}
        variant="temporary"
        onClose={handleDrawerToggle}
      >
        <DrawerList />
      </Drawer>

      <Drawer
        open
        anchor="left"
        className={classes.leftSideBarDrawer}
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: sharedStyles.sideBarWidth },
        }}
        variant="permanent"
      >
        <DrawerList />
      </Drawer>

      <Divider />
    </Box>
  );
};
