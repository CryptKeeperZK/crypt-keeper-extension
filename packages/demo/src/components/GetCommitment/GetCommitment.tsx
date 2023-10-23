import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";

import { ActionBox } from "../ActionBox/ActionBox";

interface IGetCommitmentProps {
  revealConnectedIdentityCommitment: () => Promise<void>;
}

const REVEAL_CODE = `import { initializeCryptKeeper } from "@cryptkeeperzk/providers";

const client = initializeCryptKeeper();

const connect = async () => {
  await client?.request({
    method: RPCExternalAction.REVEAL_CONNECTED_IDENTITY_COMMITMENT,
  });`;

export const GetCommitment = ({ revealConnectedIdentityCommitment }: IGetCommitmentProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Reveal connected identity Commitment</Typography>

      <ActionBox<undefined, void>
        code={REVEAL_CODE}
        option={undefined}
        testId="reveal-connected-identity-commitment"
        title="Reveal"
        onClick={revealConnectedIdentityCommitment}
      />
    </Box>
  );
};
