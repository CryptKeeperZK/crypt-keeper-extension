import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";
import { MerkleProofType } from "@src/types";

import { ActionBox } from "../ActionBox/ActionBox";

interface ISemaphoreProps {
  genSemaphoreProof: (proofType: MerkleProofType) => void;
}

export const Semaphore = ({ genSemaphoreProof }: ISemaphoreProps): JSX.Element => {
  const classes = useGlobalStyles();

  const { fileContent: code } = useFileReader("semaphore.ts");

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Integration with Semaphore</Typography>

      <ActionBox<MerkleProofType, void>
        code={code}
        option={MerkleProofType.STORAGE_ADDRESS}
        title="Generate proof from Merkle proof storage address"
        onClick={genSemaphoreProof}
      />

      <ActionBox<MerkleProofType, void>
        code={code}
        option={MerkleProofType.ARTIFACTS}
        title="Generate proof from Merkle proof artifacts"
        onClick={genSemaphoreProof}
      />
    </Box>
  );
};
