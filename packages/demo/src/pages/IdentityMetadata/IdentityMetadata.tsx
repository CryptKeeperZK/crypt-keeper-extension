import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import ActionBox from "@src/components/ActionBox";
import { Footer } from "@src/components/Footer/Footer";
import Header from "@src/components/Header";
import MarkdownBox from "@src/components/MarkdownBox";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";
import { injectMarkdownCode } from "@src/utils";

const IdentityMetadata = (): JSX.Element => {
  const { getConnectedIdentityMetadata } = useCryptKeeperClient();
  const classes = useGlobalStyles();

  const { fileContent: doc } = useFileReader("identityMetadata.md");

  const codeSnippets: Record<string, string> = {
    1: useFileReader("identityMetadata.ts").fileContent,
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
              title="Get"
              description="Get Connected Identity Metadata"
              onClick={getConnectedIdentityMetadata}
            />
            <Footer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default IdentityMetadata;
