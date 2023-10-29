import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

import ActionBox from "@src/components/ActionBox";
import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useRevealIdentity } from "./useRevealIdentity";

export const RevealIdentity = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { revealConnectedIdentityCommitment } = useRevealIdentity();

  const { fileContent: code } = useFileReader("revealIdentityCommitment.ts");

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
            <Typography variant="h6">Reveal connected identity Commitment</Typography>

            <ActionBox<undefined, void>
              code={code}
              option={undefined}
              testId="reveal-connected-identity-commitment"
              title="Reveal"
              onClick={revealConnectedIdentityCommitment}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default RevealIdentity;
