import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useGlobalStyles } from "@src/styles";

import ActionBox from "../ActionBox";

import { GENERATE_MERKLE_TREE_CODE, JOIN_GROUP_CODE } from "./codeExported";

interface IBandadaProps {
  joinGroup: () => Promise<void>;
  generateGroupMerkleProof: () => Promise<void>;
}

export const Bandada = ({ joinGroup, generateGroupMerkleProof }: IBandadaProps): JSX.Element => {
  const classes = useGlobalStyles();

  return (
    <Box
      className={classes.popup}
      sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      <Typography variant="h6">Integration with Bandada service</Typography>

      <ActionBox<null, void>
        code={GENERATE_MERKLE_TREE_CODE}
        option={null}
        title="Generate Group Merkle Proof"
        onClick={generateGroupMerkleProof}
      />

      <ActionBox<null, void> code={JOIN_GROUP_CODE} option={null} title="Join test group" onClick={joinGroup} />
    </Box>
  );
};
