import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import DisplayProof from "@src/components/DisplayProof";
import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useBandada } from "./useBandada";

export const Bandada = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { proof, joinGroup, generateGroupMerkleProof } = useBandada();

  const { fileContent: joinGroupCode } = useFileReader("joinGroup.ts");
  const { fileContent: generateGroupMerkleProofCode } = useFileReader("generateGroupMerkleProof.ts");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <Header />

      {/* Center Content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        <Container sx={{ flex: 1, position: "relative", top: 64 }}>
          <Box
            className={classes.popup}
            sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          >
            <Typography variant="h6">Integration with Bandada service</Typography>

            <ActionBox<null, void>
              code={generateGroupMerkleProofCode}
              option={null}
              title="Generate Group Merkle Proof"
              onClick={generateGroupMerkleProof}
            />

            <ActionBox<null, void> code={joinGroupCode} option={null} title="Join test group" onClick={joinGroup} />

            <DisplayProof proof={proof} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Bandada;
