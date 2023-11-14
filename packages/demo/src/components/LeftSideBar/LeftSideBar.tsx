import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { DrawerList } from "../DrawerList/DrawerList";
import { useTheme } from "@mui/styles";
import { useGlobalStyles } from "@src/styles";
import { sharedStyles } from "@src/styles/useGlobalStyles";
import Divider from "@mui/material/Divider";

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
        className={classes.leftSideBarDrawer}
        anchor="left"
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
        className={classes.leftSideBarDrawer}
        open
        anchor="left"
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
