import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import Header from "@src/components/Header";
import { useCryptKeeperClient } from "@src/context/CryptKeeperClientProvider";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useConnect } from "./useConnect";

const Connect = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { connect } = useConnect();
  const { isConnected } = useCryptKeeperClient();

  const isChangeIdentity = isConnected;

  const { fileContent: code } = useFileReader("connect.ts");

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
            <Typography variant="h6">
              {isConnected
                ? "Change Connected Identity"
                : "To continue, please connect to your CryptKeeper to continue."}
            </Typography>

            <ActionBox<boolean, void>
              code={code}
              option={isChangeIdentity}
              title="Connect to CryptKeeper"
              onClick={connect}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Connect;
