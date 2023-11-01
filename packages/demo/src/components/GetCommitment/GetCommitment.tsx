import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useCodeExample } from "@src/hooks/useCodeExample";
import { useGlobalStyles } from "@src/styles";

import ActionBox from "../ActionBox";

interface IGetCommitmentProps {
  revealConnectedIdentityCommitment: () => Promise<void>;
}

export const GetCommitment = ({ revealConnectedIdentityCommitment }: IGetCommitmentProps): JSX.Element => {
  const classes = useGlobalStyles();
  const { code } = useCodeExample("revealIdentityCommitment.ts");

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Reveal connected identity Commitment</Typography>

      <ActionBox
        code={code}
        testId="reveal-connected-identity-commitment"
        title="Reveal"
        onClick={revealConnectedIdentityCommitment}
      />
    </Box>
  );
};
