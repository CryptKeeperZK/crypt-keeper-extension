import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import Header from "@src/components/Header";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

const IdentityMetadata = (): JSX.Element => {
  const { getConnectedIdentityMetadata } = useCryptKeeperClient();
  const classes = useGlobalStyles();

  const { fileContent: code } = useFileReader("getConnectedIdentityMetadata.ts");

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
            <Typography variant="h6">Get Connected Identity Metadata</Typography>

            <ActionBox<undefined, void>
              code={code}
              option={undefined}
              title="Get Connected Identity"
              onClick={getConnectedIdentityMetadata}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default IdentityMetadata;
