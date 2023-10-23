import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";

import type { ISemaphoreFullProof, IRLNFullProof, IMerkleProof } from "@cryptkeeperzk/types";

interface IDisplayProofProps {
  proof?: ISemaphoreFullProof | IRLNFullProof | IMerkleProof;
}

export const DisplayProof = ({ proof = undefined }: IDisplayProofProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box
      className={classes.popupProof}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Generated proof output:</Typography>

      <pre data-testid="proof-json">{JSON.stringify(proof, null, 2)}</pre>
    </Box>
  );
};
