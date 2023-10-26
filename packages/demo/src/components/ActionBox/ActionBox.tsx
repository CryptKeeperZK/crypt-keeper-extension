import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/styles";
import { themes } from "prism-react-renderer";
import { LiveProvider, LiveEditor } from "react-live";

import { useGlobalStyles } from "@src/styles";

type actionFnRequiredOption<T = unknown, U = unknown> = (option: T) => U;
type actionFnOptionalOption<T = unknown, U = unknown> = (option?: T) => U;

interface IActionBox<T = unknown, U = unknown> {
  title: string;
  option: T;
  code: string;
  testId?: string;
  onClick: actionFnOptionalOption<T, U> | actionFnRequiredOption<T, U>;
}

export const ActionBox = <T, U>({ title, option, code, testId = "", onClick }: IActionBox<T, U>): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3, flexGrow: 1 }}>
      <Box>
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

      <Box className={classes.codePreview}>
        <LiveProvider disabled enableTypeScript noInline code={code}>
          <LiveEditor theme={themes.vsDark} />
        </LiveProvider>
      </Box>
    </Box>
  );
};
