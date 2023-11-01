import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useCodeExample } from "@src/hooks/useCodeExample";
import { useGlobalStyles } from "@src/styles";

import ActionBox from "../ActionBox";

interface IBandadaProps {
  joinGroup: () => Promise<void>;
  generateGroupMerkleProof: () => Promise<void>;
}

export const Bandada = ({ joinGroup, generateGroupMerkleProof }: IBandadaProps): JSX.Element => {
  const classes = useGlobalStyles();

  const { code: joinGroupCode } = useCodeExample("joinGroup.ts");
  const { code: generateGroupMerkleProofCode } = useCodeExample("generateGroupMerkleProof.ts");

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Integration with Bandada service</Typography>

      <ActionBox
        code={generateGroupMerkleProofCode}
        title="Generate Group Merkle Proof"
        onClick={generateGroupMerkleProof}
      />

      <ActionBox code={joinGroupCode} title="Join test group" onClick={joinGroup} />
    </Box>
  );
};
