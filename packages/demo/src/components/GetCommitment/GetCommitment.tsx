import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { ActionBox } from "../ActionBox/ActionBox";

interface IGetCommitmentProps {
  revealConnectedIdentityCommitment: () => Promise<void>;
}

export const GetCommitment = ({ revealConnectedIdentityCommitment }: IGetCommitmentProps): JSX.Element => {
  const classes = useGlobalStyles();
  const { fileContent: code } = useFileReader("revealIdentityCommitment.ts");

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Reveal connected identity Commitment</Typography>

      <ActionBox<undefined, void>
        code={code}
        option={undefined}
        testId="reveal-connected-identity-commitment"
        title="Reveal"
        onClick={revealConnectedIdentityCommitment}
      />
    </Box>
  );
};
