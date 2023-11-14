import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/styles";

import ActionBox from "@src/components/ActionBox";
import { Footer } from "@src/components/Footer/Footer";
import Header from "@src/components/Header";
import { MarkdownBox } from "@src/components/MarkdownBox/MarkdownBox";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";
import { injectMarkdownCode } from "@src/utils";

import { useConnect } from "./useConnect";

const Connect = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);
  const { connect } = useConnect();
  const { isConnected } = useCryptKeeperClient();

  const isChangeIdentity = isConnected;

  const { fileContent: doc } = useFileReader("connect.md");

  const codeSnippets: Record<string, string> = {
    1: useFileReader("initializeClient.ts").fileContent,
    2: useFileReader("connect.ts").fileContent,
    3: useFileReader("connectEvent.ts").fileContent,
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

            <ActionBox<boolean, void>
              description={
                isConnected
                  ? "Change Connected Identity"
                  : "To continue, please connect to your CryptKeeper to continue."
              }
              option={isChangeIdentity}
              title="Connect"
              onClick={connect}
            />

            <Footer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Connect;
