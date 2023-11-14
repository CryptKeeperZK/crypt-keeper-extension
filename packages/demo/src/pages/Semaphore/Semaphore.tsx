import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import ActionBox from "@src/components/ActionBox";
import DisplayProof from "@src/components/DisplayProof";
import { Footer } from "@src/components/Footer/Footer";
import Header from "@src/components/Header";
import MarkdownBox from "@src/components/MarkdownBox";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";
import { MerkleProofType } from "@src/types";
import { injectMarkdownCode } from "@src/utils";

import { useSemaphore } from "./useSemaphore";

export const Semaphore = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { proof, genSemaphoreProof } = useSemaphore();

  const { fileContent: doc } = useFileReader("semaphore.md");

  const codeSnippets: Record<string, string> = {
    1: useFileReader("semaphore.ts").fileContent,
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

            <ActionBox<MerkleProofType, void>
              description="Generate proof from Merkle proof storage address"
              option={MerkleProofType.STORAGE_ADDRESS}
              title="Generate"
              onClick={genSemaphoreProof}
            />

            <ActionBox<MerkleProofType, void>
              description="Generate proof from Merkle proof artifacts"
              option={MerkleProofType.ARTIFACTS}
              title="Generate"
              onClick={genSemaphoreProof}
            />

            <DisplayProof proof={proof} />

            <Footer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Semaphore;
