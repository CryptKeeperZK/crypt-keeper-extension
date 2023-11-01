import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useCodeExample } from "@src/hooks/useCodeExample";
import { useGlobalStyles } from "@src/styles";

import ActionBox from "../ActionBox";

interface IConnectProps {
  title: string;
  isChangeIdentity: boolean;
  connect: (isChangeIdentity: boolean) => void;
}

export const Connect = ({ title, isChangeIdentity = false, connect }: IConnectProps): JSX.Element => {
  const classes = useGlobalStyles();

  const { code } = useCodeExample("connect.ts");

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">{title}</Typography>

      <ActionBox<boolean, void> code={code} option={isChangeIdentity} title="Connect Identity" onClick={connect} />
    </Box>
  );
};
