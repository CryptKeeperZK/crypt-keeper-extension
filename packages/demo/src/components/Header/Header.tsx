import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";
import { useState } from "react";

import { useGlobalStyles } from "@src/styles";
import { sharedStyles } from "@src/styles/useGlobalStyles";

import { DrawerList } from "../DrawerList/DrawerList";

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
            aria-label="open drawer"
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { sm: "none" } }}
            onClick={handleDrawerToggle}
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
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          open={mobileOpen}
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
    </Box>
  );
};
