import Box from "@mui/material/Box";
import { CopyBlock, irBlack } from "react-code-blocks";

import { useGlobalStyles } from "@src/styles";

export interface IDisplayCodeProps {
  isShowCode: boolean;
  code: string;
}

export const DisplayCode = ({ isShowCode, code }: IDisplayCodeProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box className={classes.popup}>
      {isShowCode && (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        <CopyBlock codeBlock showLineNumbers wrapLines language="typescript" text={code} theme={irBlack} />
      )}
    </Box>
  );
};
