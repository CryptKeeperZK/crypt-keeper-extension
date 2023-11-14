import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Article } from "@mui/icons-material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Button, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";
import { useNavigate } from "react-router-dom";

import Icon from "@src/components/Icon";
import { Paths } from "@src/constants";
import LogoSvg from "@src/static/icons/logo.svg";
import BackgroundImage from "@src/static/images/Small_promo_tile.jpg";
import { useGlobalStyles } from "@src/styles";

function getBrowserInfo() {
  const { userAgent } = navigator;

  if (/chrome|crios|chromium/i.test(userAgent) && !/edge|edg/i.test(userAgent)) {
    return {
      name: "Chrome",
      link: "https://chrome.google.com/webstore/detail/cryptkeeper/nligojmlalemmhlmkghnflkgicnmodcl",
    };
  }
  if (/firefox|fxios/i.test(userAgent)) {
    return { name: "Firefox", link: "https://addons.mozilla.org/en-US/firefox/addon/cryptkeeper/" };
  }
  if (/brave/i.test(userAgent)) {
    return {
      name: "Brave",
      link: "https://chrome.google.com/webstore/detail/cryptkeeper/nligojmlalemmhlmkghnflkgicnmodcl",
    };
  }
  return null;
}

const Home = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const browser = getBrowserInfo();
  const buttonText = browser ? `Download on ${browser.name}` : "Not available for your browser";
  const buttonLink = browser ? browser.link : "#";

  const navigate = useNavigate();

  return (
    <Box className={classes.home}>
      <header className={classes.homeHeader}>
        <Box className={classes.navLogo}>
          <Icon size={3} url={LogoSvg} />

          <Typography className={classes.navLogoText} variant="h6">
            Crypt Keeper
          </Typography>
        </Box>

        <Box className={classes.navLinks}>
          <Button
            className={classes.footerLayerOneGithub}
            color="primary"
            startIcon={<Article />}
            style={{ textDecoration: "underline" }}
            variant="text"
            onClick={() => {
              navigate(Paths.OVERVIEW);
            }}
          >
            Docs
          </Button>

          <Button
            className={classes.footerLayerOneGithub}
            color="primary"
            startIcon={<GitHubIcon />}
            style={{ textDecoration: "underline" }}
            variant="text"
          >
            GitHub
          </Button>

          <Button
            className={classes.footerLayerOneGithub}
            color="primary"
            startIcon={<FontAwesomeIcon icon={faDiscord} />}
            style={{ textDecoration: "underline" }}
            variant="text"
          >
            Discord
          </Button>
        </Box>
      </header>

      <Box className={classes.mainContent}>
        <Typography gutterBottom variant="h1">
          Zero-knowledge Identity and Proof generation management browser extension tool.
        </Typography>

        <Stack className={classes.actionButtons} direction="column" spacing={2}>
          <Button color="primary" href={buttonLink} target="_blank" variant="outlined">
            {buttonText}
          </Button>

          {!browser && (
            <Typography gutterBottom display="block" variant="caption">
              Your browser is not supported for direct download.
            </Typography>
          )}
        </Stack>
      </Box>

      <Box className={classes.mainImage} style={{ backgroundImage: `url(${BackgroundImage})` }} />
    </Box>
  );
};

export default Home;
