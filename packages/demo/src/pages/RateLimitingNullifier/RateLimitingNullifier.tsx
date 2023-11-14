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

import { useRateLimitingNullifier } from "./useRateLimitingNullifier";

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
              description="Generate proof from Merkle proof storage address"
              option={MerkleProofType.STORAGE_ADDRESS}
              title="Generate"
              onClick={genRLNProof}
            />

            <ActionBox<MerkleProofType, void>
              description="Generate proof from Merkle proof artifacts"
              option={MerkleProofType.ARTIFACTS}
              title="Generate"
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
