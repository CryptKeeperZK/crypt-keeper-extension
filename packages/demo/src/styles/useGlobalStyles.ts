import grey from "@mui/material/colors/grey";
import makeStyles from "@mui/styles/makeStyles";

const basePopupStyle = {
  width: "50rem",
  height: "auto",
  border: `1px solid ${grey[700]}`,
  margin: "2rem auto",
};

export const useGlobalStyles = makeStyles(() => ({
  popup: {
    ...basePopupStyle,
  },
  popupProof: {
    ...basePopupStyle,
    width: "70rem",
  },
}));
