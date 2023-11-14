import Box from "@mui/material/Box";
import Container from "@mui/material/Container";

import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { MarkdownBox } from "@src/components/MarkdownBox/MarkdownBox";
import { useTheme } from "@mui/styles";
import { Footer } from "@src/components/Footer/Footer";

const Terms = (): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  const { fileContent: doc } = useFileReader("terms.md");

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
            <MarkdownBox doc={doc} />
            <Footer />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Terms;
