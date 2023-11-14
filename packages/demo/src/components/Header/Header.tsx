import MenuIcon from "@mui/icons-material/Menu";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/styles";
import { useState } from "react";
import { ToastContainer } from "react-toastify";

import { useGlobalStyles } from "@src/styles";
import { sharedStyles } from "@src/styles/useGlobalStyles";

import { LeftSideBar } from "../LeftSideBar/LeftSideBar";
import RightSideBar from "../RightSideBar";

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

        <LeftSideBar handleDrawerToggle={handleDrawerToggle} isMobileOpen={isMobileOpen} />
      </Box>

      {/* RightSideBar */}
      <RightSideBar />

      <ToastContainer newestOnTop />
    </Box>
  );
};
