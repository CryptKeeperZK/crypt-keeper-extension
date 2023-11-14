import { Theme, alpha } from "@mui/material";
import grey from "@mui/material/colors/grey";
import makeStyles from "@mui/styles/makeStyles";

const basePopupStyle = {
  width: "50rem",
  height: "auto",
  margin: "2rem auto",
};

const sharedListItemText = {
  fontSize: 10,
  fontWeight: "medium",
};

const sharedListHover = {
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "4px",
  },
  "&:focus": {
    bgcolor: "rgba(255, 255, 255, 0.05)",
    borderRadius: "4px",
  },
};

export const sharedStyles = {
  sideBarWidth: 350,
  sideBarColor: "#012120",
};

export const useGlobalStyles = makeStyles((theme: Theme) => ({
  // HOME
  home: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Centers vertically in the viewport
    alignItems: "center", // Centers horizontally in the viewport
    minHeight: "100vh", // Takes at least the full height of the viewport
    padding: theme.spacing(2), // Adds some padding around the edges
    // Ensure that the content doesn't stretch too wide:
    maxWidth: "1200px", // Adjust the max-width to your preference
    margin: "0 auto", // This applies auto margin to the left and right, centering the div
    width: "100%", // This ensures it doesn't exceed the maxWidth
    boxSizing: "border-box", // Makes sure padding doesn't add to the width
    backgroundColor: theme.palette.background.default,
  },

  homeHeader: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    color: "white",
    maxWidth: "1200px", // Match this value to the maxWidth of your main content
    width: "100%",
    margin: "0 auto", // This centers the header
    zIndex: 1000, // Ensure the header is above other items
  },

  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  navLogoText: {
    marginRight: "1rem",
    marginLeft: theme.spacing(1),
    fontWeight: "bold",
  },

  navLinks: {
    gap: "8px",
    textDecoration: "underline",
    "& svg": {
      marginLeft: "1rem",
    },
  },

  mainContent: {
    textAlign: "center",
    color: "white",
    marginBottom: theme.spacing(4), // Adjust the spacing as needed
  },

  actionButtons: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "& > *": {
      marginBottom: theme.spacing(2), // Space between buttons
    },
  },

  mainImage: {
    width: "50%", // or some other appropriate width
    height: "400px", // or some other appropriate height
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  },

  // Footer
  footer: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  footerLayerOneGithub: {
    marginRight: "auto",
    justifyContent: "flex-start",
  },

  footerLayerOne: {
    display: "flex",
    marginBottom: theme.spacing(2),
  },

  footerLayerTwo: {
    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(1, 0),
  },

  footerLayerThree: {
    marginTop: theme.spacing(1),
    display: "flex",
    justifyContent: "flex-end",
    width: "100%",
  },

  connectedIdentity: {
    padding: theme.spacing(2),
    borderWidth: "1px",
    borderStyle: "solid",
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    borderRadius: theme.shape.borderRadius,
    width: sharedStyles.sideBarWidth * 0.9,
    position: "fixed",
    marginTop: theme.spacing(2),
    top: 64,
    display: "block",
    backgroundColor: "#202020",
  },

  actionBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(3),
    flexGrow: 1,
    justifyContent: "center",
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#202020",
  },

  popup: {
    ...basePopupStyle,
  },

  popupProof: {
    ...basePopupStyle,
    border: `1px solid ${grey[700]}`,
    width: "70rem",
  },

  icon: {
    alignItems: "center",
    justifyContent: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "center",
    fontFamily: "Font Awesome 5 Free",
    userSelect: "none",
    flexFlow: "row nowrap",
    display: "flex",
  },

  icon__text: {
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: 400,
    height: "80%",
    width: "80%",
    backgroundColor: `rgba(${grey[900]}, 0.05)`, // Adjusted for MUI's color system
    borderRadius: "50%",
  },

  icon__disabled: {
    opacity: 0.5,
    cursor: "default",
  },

  codePreview: {
    maxHeight: 200,
    overflowY: "auto",
    border: `1px solid ${theme.palette.common.black}`,
    borderRadius: "4px",
    transition: "overflow-y 0.3s", // Add a smooth transition for overflow-y property
    "&:hover": {
      overflowY: "auto", // Show the scrollbar on hover
    },
    "&::-webkit-scrollbar": {
      width: "8px", // Set the width of the scrollbar
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#888", // Set the color of the scrollbar thumb
      borderRadius: "4px", // Optional: Round the corners of the scrollbar thumb
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: "#555", // Set the color of the scrollbar thumb on hover
    },

    "&::-webkit-scrollbar-track": {
      backgroundColor: "#1e1e1e",
    },

    scrollbarWidth: "thin", // For Firefox: Set the width of the scrollbar
  },

  showImgButton: {
    color: theme.palette.common.white,
  },

  leftSideBar: {
    left: 0,
    top: 0,
    bottom: 0,
    overflowY: "auto",
    flexShrink: 0,
    position: "fixed",
    backgroundColor: theme.palette.background.default,
    zIndex: 1,
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },

  leftSideBarDrawer: {
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },

  rightSideBar: {
    width: sharedStyles.sideBarWidth,
    right: 0,
    bottom: 0,
    overflowY: "auto",
    flexShrink: 0,
    position: "fixed",
    backgroundColor: theme.palette.background.default,
  },

  rightSideListActiveHeader: {
    color: theme.palette.primary.main,
  },

  rightSideList: {
    top: "340px",
  },

  rightSideListItem: {
    transition: "0.3s",
    borderLeft: "4px solid transparent",
    "&:hover": {
      backgroundColor: theme.palette.background.default,
      color: theme.palette.primary.main,
      borderLeft: `4px solid ${theme.palette.primary.main}`,
    },
  },

  listItemIndentationH1: {
    display: "block",
    paddingLeft: theme.spacing(2),
  },

  listItemIndentationH2: {
    display: "block",
    paddingLeft: theme.spacing(4),
  },

  h2Style: {
    paddingLeft: "40px",
  },

  header: {
    position: "fixed",
    top: 0,
    height: "63px",
    width: `calc(100% - ${sharedStyles.sideBarWidth}px)`,
  },

  headerToolbar: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main,
    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },

  drawerList: {
    position: "fixed",
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main,
    width: sharedStyles.sideBarWidth,
    height: "100%",
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },

  listBox: {
    borderRadius: 2,
  },

  listBoxArrow: {
    marginRight: theme.spacing(2),
    transform: "rotate(0deg)",
    transition: "0.2s",
    fontSize: "inherit",
  },

  listBoxArrowRotated: {
    transform: "rotate(90deg)",
  },

  listBoxHeader: {
    px: theme.spacing(2),
    py: theme.spacing(1),
    fontSize: "14px",
    fontWeight: theme.typography.fontWeightMedium,
    ...sharedListHover,
  },

  listBoxSubHeader: {
    padding: theme.spacing(0.5),
    fontSize: "14px",
    fontWeight: theme.typography.fontWeightMedium,
    position: "relative",
    borderLeft: `1px solid transparent`,
  },

  listBoxItem: {
    padding: theme.spacing(0.5),
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    position: "relative",
    marginLeft: theme.spacing(3),
    cursor: "pointer",
    ...sharedListHover,
  },

  listBoxItemHeaderText: {
    ...sharedListItemText,
    color: theme.palette.primary.main,
  },

  listBoxItemItemText: {
    ...sharedListItemText,
    color: theme.palette.common.white,
  },

  drawerToolbar: {
    backgroundColor: theme.palette.background.default,
  },

  markdown: {
    top: 64,
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      fontWeight: "bold",
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1.5),
      lineHeight: 1.3,
    },
    "& h1": {
      fontSize: "2rem",
    },
    "& h2": {
      fontSize: "1.75rem",
    },
    "& h3": {
      fontSize: "1.5rem",
    },
    "& p": {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5),
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    "& ul, & ol": {
      paddingLeft: theme.spacing(3),
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    "& li": {
      marginTop: theme.spacing(0.5),
      marginBottom: theme.spacing(0.5),
    },
    "& a": {
      color: theme.palette.common.white,
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
      },
    },
    "& code": {
      borderRadius: "3px",
      color: "#d73a49",
      backgroundColor: "rgba(27,31,35,0.05)",
      padding: "0.2em 0.4em",
      margin: 0,
      fontSize: "85%",
      fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    "& img": {
      width: "50%",
      height: "40%",
      objectFit: "cover",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
    },
  },
  markdownCodeCopyBox: {
    position: "absolute",
    top: "10px",
    right: "10px",
    cursor: "pointer",
  },
  markdownCodeCopiedBox: {
    backgroundColor: "#333",
    padding: "5px 10px",
    borderRadius: "4px",
    marginBottom: "5px",
    color: "white",
    position: "relative",
  },
  markdownCodeCopied: {
    position: "absolute",
    top: "100%",
    left: "50%",
    marginLeft: "-5px",
    width: "0",
    height: "0",
    borderTop: "5px solid #333",
    borderRight: "5px solid transparent",
    borderLeft: "5px solid transparent",
  },
  markdownCodeCopiedCheck: {
    backgroundColor: "#4CAF50",
    padding: "5px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "25px",
    height: "25px",
  },
  markdownCodeCopy: {
    backgroundColor: "#333",
    padding: "5px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "25px",
    height: "25px",
  },
}));
