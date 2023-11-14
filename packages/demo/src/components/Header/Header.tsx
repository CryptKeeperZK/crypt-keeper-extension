import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";
import { MutableRefObject, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { useGlobalStyles } from "@src/styles";
import { sharedStyles } from "@src/styles/useGlobalStyles";

import ConnectedIdentity from "../ConnectedIdentity";
import { DrawerList } from "../DrawerList/DrawerList";
import RightSideBar from "../RightSideBar";
import { LeftSideBar } from "../LeftSideBar/LeftSideBar";

interface IHeader {
  type: "h1" | "h2"; // Add more header levels as needed
  text: string;
  id?: string;
}

export const Header = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <Box>
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
          </Toolbar>
        </AppBar>

        {/* LeftSideBar */}

        <LeftSideBar isMobileOpen={isMobileOpen} handleDrawerToggle={handleDrawerToggle} />
      </Box>

      {/* RightSideBar */}
      <RightSideBar />
      <ToastContainer newestOnTop />
    </Box>
  );
};
