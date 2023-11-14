import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import DisplayProof from "@src/components/DisplayProof";
import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useBandada } from "./useBandada";
import { injectMarkdownCode } from "@src/utils";
import MarkdownBox from "@src/components/MarkdownBox";
import { Footer } from "@src/components/Footer/Footer";

export const Bandada = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { proof, joinGroup, generateGroupMerkleProof } = useBandada();

  const { fileContent: joinGroupCode } = useFileReader("joinGroup.ts");
  const { fileContent: generateGroupMerkleProofCode } = useFileReader("generateGroupMerkleProof.ts");

  const { fileContent: doc } = useFileReader("bandada.md");

  const codeSnippets: Record<string, string> = {
    1: useFileReader("join.ts").fileContent,
    2: useFileReader("joinEvent.ts").fileContent,
    3: useFileReader("generate.ts").fileContent,
    4: useFileReader("generateEvent.ts").fileContent,
  };

  const injectedMarkdown = injectMarkdownCode(doc, codeSnippets);

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
            <MarkdownBox doc={injectedMarkdown} />

            <ActionBox<null, void>
              option={null}
              title="Generate"
              description="Generate Group Merkle Proof"
              onClick={generateGroupMerkleProof}
            />

            <ActionBox<null, void> option={null} title="Join" description="Join test group" onClick={joinGroup} />

            <DisplayProof proof={proof} />
            <Footer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Bandada;
