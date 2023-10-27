import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/styles";

import { useGlobalStyles } from "@src/styles";
import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import { DrawerList } from "../DrawerList/DrawerList";
import { sharedStyles } from "@src/styles/useGlobalStyles";

export const Header = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const container = window.document.body;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar
        className={classes.header}
        sx={{
          width: { sm: `calc(100% - ${sharedStyles.sideBarWidth}px)` },
          ml: { sm: `${sharedStyles.sideBarWidth}px` },
        }}
      >
        <Toolbar className={classes.headerToolbar}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="div" variant="h6">
            CryptKeeper Demo
          </Typography>
        </Toolbar>
      </AppBar>

      {/* LeftSideBar */}
      <Box
        className={classes.leftSideBar}
        component="nav"
        sx={{ width: { sm: sharedStyles.sideBarWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          anchor="left"
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: sharedStyles.sideBarWidth },
          }}
        >
          <DrawerList />
        </Drawer>

        <Drawer
          anchor="left"
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: sharedStyles.sideBarWidth },
          }}
          open
        >
          <DrawerList />
        </Drawer>
        <Divider />
      </Box>
    </Box>
  );
};
