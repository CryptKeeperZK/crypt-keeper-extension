import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useRevealIdentity } from "./useRevealIdentity";
import MarkdownBox from "@src/components/MarkdownBox";
import { injectMarkdownCode } from "@src/utils";
import { Footer } from "@src/components/Footer/Footer";

export const RevealIdentity = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { revealConnectedIdentityCommitment } = useRevealIdentity();

  const { fileContent: doc } = useFileReader("reveal.md");

  const codeSnippets: Record<string, string> = {
    1: useFileReader("reveal.ts").fileContent,
    2: useFileReader("revealEvent.ts").fileContent,
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
            <ActionBox<undefined, void>
              option={undefined}
              description="Reveal connected identity Commitment"
              testId="reveal-connected-identity-commitment"
              title="Reveal"
              onClick={revealConnectedIdentityCommitment}
            />
            <Footer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default RevealIdentity;
