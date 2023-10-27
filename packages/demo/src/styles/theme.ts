import { grey } from "@mui/material/colors";
import { createTheme, lighten } from "@mui/material/styles";

export const PALETTE = {
  background: {
    default: "#181818",
    paper: "#fff",
  },

  common: {
    white: "#fff",
    black: "#181818",
  },

  action: {
    disabledBackground: "#94febf",
    disabled: lighten("#94febf", 0.75),
  },

  primary: {
    main: "#94febf",
  },

  secondary: {
    main: "#2580f8",
  },

  text: {
    primary: grey[200],
    secondary: grey[400],
    500: grey[500],
    800: grey[800],
    900: grey[900],
  },

  error: {
    main: "#f52525",
    light: lighten("#f52525", 0.7),
  },

  info: {
    main: lighten("#000", 0.75),
  },

  warning: {
    main: "#ffcc00",
  },

  success: {
    main: "#2ed272",
  },
};

export const theme = createTheme({
  palette: PALETTE,

  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          textTransform: "none",

          "&:disabled": {
            backgroundColor: ownerState.variant === "contained" ? grey[400] : "inherit",
          },
        }),
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: ({ theme: { palette } }) => ({
          backgroundColor: palette.background.default,
          border: `1px solid ${grey[700]}`,
          borderRadius: "0.75rem",
        }),
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme: { palette } }) => ({
          transition: "all 200ms",

          "&:hover": {
            backgroundColor: lighten(palette.background.default, 0.06),
          },
        }),

        focusVisible: ({ theme: { palette } }) => ({
          backgroundColor: lighten(palette.background.default, 0.06),
        }),

        selected: ({ theme: { palette } }) => ({
          backgroundColor: lighten(palette.background.default, 0.06),
        }),
      },
    },

    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          margin: 0,
          padding: 0,
          backgroundColor: PALETTE.background.default,
          color: PALETTE.common.white,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          WebkitTapHighlightColor: "rgba(255, 255, 255, 0)",
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          justifyContent: "center",
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        root: ({ theme: { palette } }) => ({
          top: 0,
          backgroundColor: palette.background.default
        }),
        paper: {
          top: 64,
        }
      }
    },

    MuiPaper: {
      styleOverrides: {
        root: ({ theme: { palette } }) => ({
          backgroundColor: palette.background.default
        })
      }
    }
  },
});
