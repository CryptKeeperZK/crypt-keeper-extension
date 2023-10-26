import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";

import { useGlobalStyles } from "@src/styles";

const drawerWidth = 256;

export const Header = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <AppBar
      className={classes.header}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar className={classes.headerToolbar}>
        <Typography component="div" variant="h6">
          CryptKeeper Demo
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
