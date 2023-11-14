import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useImportIdentity } from "./useImportIdentitiy";
import MarkdownBox from "@src/components/MarkdownBox";
import { injectMarkdownCode } from "@src/utils";
import { Footer } from "@src/components/Footer/Footer";

export const ImportIdentity = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { importIdentity } = useImportIdentity();

  const { fileContent: doc } = useFileReader("importIdentity.md");

  const codeSnippets: Record<string, string> = {
    1: useFileReader("importIdentity.ts").fileContent,
    2: useFileReader("importEvent.ts").fileContent,
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
            component="form"
            sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          >
            <MarkdownBox doc={injectedMarkdown} />

            <ActionBox<undefined, void>
              option={undefined}
              description="Import identity with trapdoor and nullifier"
              testId="import-identity"
              title="Import"
              onClick={importIdentity}
            >
              <TextField id="trapdoor" label="Trapdoor" variant="filled" />

              <TextField id="nullifier" label="Nullifier" variant="filled" />
            </ActionBox>
            <Footer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default ImportIdentity;
