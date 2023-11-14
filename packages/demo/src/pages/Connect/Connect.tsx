import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import Header from "@src/components/Header";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useConnect } from "./useConnect";
import RightSideBar from "@src/components/RightSideBar";
import { MarkdownBox } from "@src/components/MarkdownBox/MarkdownBox";
import List from "@mui/material/List";
import { useTheme } from "@mui/styles";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useMarkdownHeaders } from "@src/context/MarkdownHeadersProvider";
import { injectMarkdownCode } from "@src/utils";
import { Footer } from "@src/components/Footer/Footer";

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
              option={isChangeIdentity}
              title="Connect"
              description={
                isConnected
                  ? "Change Connected Identity"
                  : "To continue, please connect to your CryptKeeper to continue."
              }
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
