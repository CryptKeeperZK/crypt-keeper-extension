import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/styles";
import { themes } from "prism-react-renderer";
import { ReactNode } from "react";
import { LiveProvider, LiveEditor } from "react-live";

import { useGlobalStyles } from "@src/styles";
import { sharedStyles } from "@src/styles/useGlobalStyles";

type actionFnRequiredOption<T = unknown, U = unknown> = (option: T) => U;
type actionFnOptionalOption<T = unknown, U = unknown> = (option?: T) => U;

interface IActionBox<T = unknown, U = unknown> {
  children?: ReactNode;
  title: string;
  description?: string;
  option: T;
  code?: string;
  testId?: string;
  onClick: actionFnOptionalOption<T, U> | actionFnRequiredOption<T, U>;
}

export const ActionBox = <T, U>({
  children,
  title,
  description,
  option,
  code,
  testId = "",
  onClick,
}: IActionBox<T, U>): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Box className={classes.actionBox}>
      <Box
        sx={{
          p: 2,
          width: sharedStyles.sideBarWidth * 0.9,
          top: 64,
          mx: "auto",
          display: "block",
        }}
      >
        <Box>
          <Typography alignItems="center" color="primary" display="flex" mb={2} variant="subtitle1">
            <PlayCircleFilledIcon sx={{ color: "primary.main", mr: 1 }} /> Demo Action
          </Typography>
        </Box>

        <Typography sx={{ mb: 3 }} variant="h6">
          {description}
        </Typography>

        {children}

        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Button
            data-testid={testId}
            sx={{ textTransform: "none", mb: 1 }}
            type="submit"
            variant="contained"
            onClick={() => onClick(option)}
          >
            {title}
          </Button>
        </Box>
      </Box>

      {code && (
        <Box className={classes.codePreview}>
          <LiveProvider disabled enableTypeScript noInline code={code}>
            <LiveEditor theme={themes.vsDark} />
          </LiveProvider>
        </Box>
      )}
    </Box>
  );
};
