import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import useTheme from "@mui/styles/useTheme";

import { useGlobalStyles } from "@src/styles/useGlobalStyles";

import { useDrawerList } from "./useDrawerList";
import ListItemIcon from "@mui/material/ListItemIcon";
import Toolbar from "@mui/material/Toolbar";

export const DrawerList = () => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const {
    isShowGetStarted,
    isShowIdentityManagement,
    isShowZkpManagement,
    getStartedData,
    identityManagementData,
    zkpManagementData,
    handleGetStartedList,
    handleIdentityManagementList,
    handleZkpManagementList,
  } = useDrawerList();
  return (
    <Box className={classes.drawerList}>
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

      {/* Get started */}
      <Box
        sx={{
          bgcolor: isShowGetStarted ? "rgba(71, 98, 130, 0.2)" : null,
          pb: isShowGetStarted ? 2 : 0,
        }}
      >
        <ListItemButton
          alignItems="flex-start"
          sx={{
            px: 3,
            pt: 2.5,
            pb: isShowGetStarted ? 0 : 2.5,
            "&:hover, &:focus": { "& svg": { opacity: isShowGetStarted ? 1 : 0 } },
          }}
          onClick={handleGetStartedList}
        >
          <ListItemText
            primary={getStartedData.title}
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: "medium",
              lineHeight: "20px",
              mb: "2px",
            }}
            secondaryTypographyProps={{
              noWrap: true,
              fontSize: 12,
              lineHeight: "16px",
              color: isShowGetStarted ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.5)",
            }}
            sx={{ my: 0 }}
          />

          <KeyboardArrowDown
            sx={{
              mr: -1,
              opacity: 0,
              transform: isShowGetStarted ? "rotate(-180deg)" : "rotate(0)",
              transition: "0.2s",
            }}
          />
        </ListItemButton>

        {isShowGetStarted &&
          getStartedData.features.map((item) => (
            <ListItemButton
              key={item.label}
              sx={{ py: 0, minHeight: 32, color: "rgba(255,255,255,.8)" }}
              onClick={() => {
                console.log("Hi");
              }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }} />
            </ListItemButton>
          ))}
      </Box>

      {/* Identity Management */}
      <Box
        sx={{
          bgcolor: isShowIdentityManagement ? "rgba(71, 98, 130, 0.2)" : null,
          pb: isShowIdentityManagement ? 2 : 0,
        }}
      >
        <ListItemButton
          alignItems="flex-start"
          sx={{
            px: 3,
            pt: 2.5,
            pb: isShowIdentityManagement ? 0 : 2.5,
            "&:hover, &:focus": { "& svg": { opacity: isShowIdentityManagement ? 1 : 0 } },
          }}
          onClick={handleIdentityManagementList}
        >
          <ListItemText
            primary={identityManagementData.title}
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: "medium",
              lineHeight: "20px",
              mb: "2px",
            }}
            secondaryTypographyProps={{
              noWrap: true,
              fontSize: 12,
              lineHeight: "16px",
              color: isShowIdentityManagement ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.5)",
            }}
            sx={{ my: 0 }}
          />

          <KeyboardArrowDown
            sx={{
              mr: -1,
              opacity: 0,
              transform: isShowIdentityManagement ? "rotate(-180deg)" : "rotate(0)",
              transition: "0.2s",
            }}
          />
        </ListItemButton>

        {isShowIdentityManagement &&
          identityManagementData.features.map((item) => (
            <ListItemButton
              key={item.label}
              sx={{ py: 0, minHeight: 32, color: "rgba(255,255,255,.8)" }}
              onClick={() => {
                console.log("Hi");
              }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }} />
            </ListItemButton>
          ))}
      </Box>

      {/* Zero-knowledge Protocols */}
      <Box
        sx={{
          bgcolor: isShowZkpManagement ? "rgba(71, 98, 130, 0.2)" : null,
          pb: isShowZkpManagement ? 2 : 0,
        }}
      >
        <ListItemButton
          alignItems="flex-start"
          sx={{
            px: 3,
            pt: 2.5,
            pb: isShowZkpManagement ? 0 : 2.5,
            "&:hover, &:focus": { "& svg": { opacity: isShowZkpManagement ? 1 : 0 } },
          }}
          onClick={handleZkpManagementList}
        >
          <ListItemText
            primary={zkpManagementData.title}
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: "medium",
              lineHeight: "20px",
              mb: "2px",
            }}
            secondaryTypographyProps={{
              noWrap: true,
              fontSize: 12,
              lineHeight: "16px",
              color: isShowZkpManagement ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.5)",
            }}
            sx={{ my: 0 }}
          />

          <KeyboardArrowDown
            sx={{
              mr: -1,
              opacity: 0,
              transform: isShowZkpManagement ? "rotate(-180deg)" : "rotate(0)",
              transition: "0.2s",
            }}
          />
        </ListItemButton>

        {isShowZkpManagement &&
          zkpManagementData.features.map((item) => (
            <ListItemButton
              key={item.label}
              sx={{ py: 0, minHeight: 32, color: "rgba(255,255,255,.8)" }}
              onClick={() => {
                console.log("Hi");
              }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: "medium" }} />
            </ListItemButton>
          ))}
      </Box>
    </Box>
  );
};
