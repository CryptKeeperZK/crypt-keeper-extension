import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useCodeExample } from "@src/hooks/useCodeExample";
import { useGlobalStyles } from "@src/styles";
import { MerkleProofType } from "@src/types";

import { ActionBox } from "../ActionBox/ActionBox";

interface IRateLimitingNullifierProps {
  genRLNProof: (proofType: MerkleProofType) => void;
}

export const RateLimitingNullifier = ({ genRLNProof }: IRateLimitingNullifierProps): JSX.Element => {
  const classes = useGlobalStyles();
  const { code } = useCodeExample("rateLimitingNullifier.ts");

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Integration with Rate-Limiting Nullifier (RLN)</Typography>

      <ActionBox<MerkleProofType, void>
        code={code}
        option={MerkleProofType.STORAGE_ADDRESS}
        title="Generate proof from Merkle proof storage address"
        onClick={genRLNProof}
      />

      <ActionBox<MerkleProofType, void>
        code={code}
        option={MerkleProofType.ARTIFACTS}
        title="Generate proof from Merkle proof artifacts"
        onClick={genRLNProof}
      />
    </Box>
  );
};
