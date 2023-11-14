import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ArrowBackIosNewOutlined, ArrowForwardIosOutlined, Twitter } from "@mui/icons-material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Box, Button, IconButton, useTheme } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { useGlobalStyles } from "@src/styles/useGlobalStyles";

const pages = [
  // GettingStarted
  { path: Paths.OVERVIEW, label: "Overview" },
  { path: Paths.CONTRIBUTING, label: "Contributing" },

  // DEMO
  { path: Paths.CONNECT, label: "Connect to CryptKeeper" },
  { path: Paths.GET_IDENTITY_METADATA, label: "Connected Identity Metadata" },
  { path: Paths.IMPORT_IDENTITY, label: "Import Identity" },
  { path: Paths.REVEAL_IDENTITY_COMMITMENT, label: "Reveal Identity Commitment" },
  { path: Paths.SEMAPHORE, label: "Semaphore" },
  { path: Paths.RLN, label: "Rate-Limiting Nullifier" },
  { path: Paths.BANDADA, label: "Bandada" },

  // References
  { path: Paths.TERMS, label: "Terms" },
  { path: Paths.FAQ, label: "FAQ" },
  { path: Paths.RESOURCES, label: "Resources" },
  { path: Paths.PRIVACY_POLICY, label: "Privacy Policy" },
];

export const Footer = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const location = useLocation();
  const navigate = useNavigate();

  const currentPageIndex = pages.findIndex((page) => page.path === location.pathname);
  const previousPage = pages[currentPageIndex - 1] || pages[pages.length - 1];
  const nextPage = pages[currentPageIndex + 1] || pages[0];
  return (
    <Box className={classes.footer}>
      {/* Layer One */}
      <Box className={classes.footerLayerOne}>
        <Button className={classes.footerLayerOneGithub} color="primary" startIcon={<GitHubIcon />} variant="outlined">
          Edit on GitHub
        </Button>
      </Box>

      {/* Layer Two */}
      <Box className={classes.footerLayerTwo}>
        <Button
          startIcon={<ArrowBackIosNewOutlined />}
          onClick={() => {
            navigate(previousPage.path);
          }}
        >
          {previousPage.label}
        </Button>

        <Button
          endIcon={<ArrowForwardIosOutlined />}
          onClick={() => {
            navigate(nextPage.path);
          }}
        >
          {nextPage.label}
        </Button>
      </Box>

      {/* Layer Three */}
      <Box className={classes.footerLayerThree}>
        <IconButton aria-label="Discord" color="primary">
          <FontAwesomeIcon icon={faDiscord} />
        </IconButton>

        <IconButton aria-label="Twitter" color="primary">
          <Twitter />
        </IconButton>

        <IconButton aria-label="GitHub" color="primary">
          <GitHubIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
