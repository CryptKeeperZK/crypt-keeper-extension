import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import DisplayProof from "@src/components/DisplayProof";
import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";
import { MerkleProofType } from "@src/types";

import { useRateLimitingNullifier } from "./useRateLimitingNullifier";
import { injectMarkdownCode } from "@src/utils";
import MarkdownBox from "@src/components/MarkdownBox";
import { Footer } from "@src/components/Footer/Footer";

export const RateLimitingNullifier = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { proof, genRLNProof } = useRateLimitingNullifier();

  const { fileContent: doc } = useFileReader("rln.md");

  const codeSnippets: Record<string, string> = {
    1: useFileReader("rln.ts").fileContent,
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
              option={MerkleProofType.STORAGE_ADDRESS}
              title="Generate"
              description="Generate proof from Merkle proof storage address"
              onClick={genRLNProof}
            />

            <ActionBox<MerkleProofType, void>
              option={MerkleProofType.ARTIFACTS}
              title="Generate"
              description="Generate proof from Merkle proof artifacts"
              onClick={genRLNProof}
            />

            <DisplayProof proof={proof} />
            <Footer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default RateLimitingNullifier;
