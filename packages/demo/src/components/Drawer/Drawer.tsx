import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/styles";

import DrawerList from "@src/components/DrawerList";
import { useGlobalStyles } from "@src/styles";

export const Drawer = () => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);
  const drawerWidth = 256;

  return (
    <Box
      aria-label="mailbox folders"
      className={classes.drawer}
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <Toolbar className={classes.drawerToolbar} />

      <ListItemButton component="a" href="#customized-list">
        <ListItemIcon sx={{ fontSize: 20 }}>🔥</ListItemIcon>

        <ListItemText
          primary="Features"
          primaryTypographyProps={{
            fontSize: 20,
            fontWeight: "medium",
            letterSpacing: 0,
          }}
          sx={{ my: 0 }}
        />
      </ListItemButton>

      <DrawerList />

      <Divider />
    </Box>
  );
};
