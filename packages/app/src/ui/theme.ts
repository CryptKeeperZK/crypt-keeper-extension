import { grey } from "@mui/material/colors";
import { createTheme, lighten } from "@mui/material/styles";

const PALETTE = {
  background: {
    default: "#000",
    paper: "#fff",
  },

  common: {
    black: "#000",
    white: "#fff",
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
  },

  error: {
    main: "#f52525",
    light: lighten("#f52525", 0.7),
  },

  info: {
    main: lighten("#000", 0.75),
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
  },
});
