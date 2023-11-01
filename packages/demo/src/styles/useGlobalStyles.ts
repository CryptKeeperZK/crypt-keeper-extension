import { Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const basePopupStyle = {
  width: "50rem",
  height: "auto",
  margin: "2rem auto",
};

export const useGlobalStyles = makeStyles((theme: Theme) => ({
  popup: {
    ...basePopupStyle,
    border: `1px solid ${theme.palette.grey[700]}`,
  },
  popupProof: {
    ...basePopupStyle,
    border: `1px solid ${theme.palette.grey[700]}`,
    width: "70rem",
  },

  codePreview: {
    maxHeight: 200,
    overflowY: "auto",
    border: `1px solid ${theme.palette.common.black}`,
    borderRadius: "4px",
    transition: "overflow-y 0.3s",

    "&:hover": {
      overflowY: "auto",
    },

    "&::-webkit-scrollbar": {
      width: "8px",
    },

    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.grey[500],
      borderRadius: "4px",
    },

    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: theme.palette.grey[600],
    },

    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.grey[900],
    },

    scrollbarWidth: "thin",
  },
}));
