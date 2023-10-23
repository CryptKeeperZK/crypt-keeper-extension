import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";

import { ActionBox } from "../ActionBox/ActionBox";

interface IConnectProps {
  title: string;
  isChangeIdentity: boolean;
  connect: (isChangeIdentity: boolean) => void;
}

const CONNECT_CODE = `import { initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const connect = async (isChangeIdentity = false) => {
    await client
      ?.connect(isChangeIdentity)
      .then(() => {
          // SOME CODE
      })
      .catch((error: Error) => {
          // THROW ERROR
      });
  };`;

export const Connect = ({ title, isChangeIdentity = false, connect }: IConnectProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">{title}</Typography>

      <ActionBox<boolean, void>
        code={CONNECT_CODE}
        option={isChangeIdentity}
        title="Connect Identity"
        onClick={connect}
      />
    </Box>
  );
};
