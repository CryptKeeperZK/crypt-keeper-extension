import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { CopyBlock, vs2015 } from "react-code-blocks";

type actionFnRequiredOption<T = unknown, U = unknown> = (option: T) => U;
type actionFnOptionalOption<T = unknown, U = unknown> = (option?: T) => U;

interface IActionBox<T = unknown, U = unknown> {
  title: string;
  option: T;
  code: string;
  testId?: string;
  onClick: actionFnOptionalOption<T, U> | actionFnRequiredOption<T, U>;
}

export const ActionBox = <T, U>({ title, option, code, testId = "", onClick }: IActionBox<T, U>): JSX.Element => (
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

    {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error */}
    <CopyBlock codeBlock showLineNumbers wrapLines language="typescript" text={code} theme={vs2015} />
  </Box>
);
