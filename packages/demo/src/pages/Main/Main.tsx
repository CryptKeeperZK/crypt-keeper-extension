import LockOpenIcon from "@mui/icons-material/LockOpen";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
import { useTheme } from "@mui/styles";
import { type SyntheticEvent, useState } from "react";
import { ToastContainer } from "react-toastify";

import Bandada from "@src/components/Bandada";
import Connect from "@src/components/Connect";
import ConnectedIdentity from "@src/components/ConnectedIdentity";
import DisplayCode, { type IDisplayCodeProps } from "@src/components/DisplayCode";
import DisplayProof from "@src/components/DisplayProof";
import Drawer from "@src/components/Drawer";
import GetCommitment from "@src/components/GetCommitment";
import GetMetadata from "@src/components/GetMetadata";
import Header from "@src/components/Header";
import ImportIdentity from "@src/components/ImportIdentity";
import RateLimitingNullifier from "@src/components/RateLimitingNullifier";
import Semaphore from "@src/components/Semaphore";
import VerifiableCredentials from "@src/components/VerifiableCredentials";
import { useCryptKeeper } from "@src/hooks/useCryptKeeper";

export const Main = (): JSX.Element => {
  const theme = useTheme();
  const [value, setValue] = useState("0");
  const [codeData, setCodeData] = useState<IDisplayCodeProps>({
    isShowCode: false,
    code: "",
  });

  const handleCodeFromActionBox = ({ isShowCode, code }: IDisplayCodeProps) => {
    setCodeData({ isShowCode, code });
  };

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const {
    isLocked,
    connectedIdentityMetadata,
    proof,
    connectedCommitment,
    getConnectedIdentityMetadata,
    connect,
    genSemaphoreProof,
    genRLNProof,
    addVerifiableCredentialRequest,
    generateVerifiablePresentationRequest,
    revealConnectedIdentityCommitment,
    joinGroup,
    generateGroupMerkleProof,
    importIdentity,
  } = useCryptKeeper();

  if (isLocked) {
    return (
      <Box component="form" sx={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", height: "100%" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3, flexGrow: 1 }}>
          <LockOpenIcon color="primary" fontSize="inherit" />

          <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main" }} variant="h4">
            Welcome to CryptKeeper Demo!
          </Typography>
        </Box>

        <Connect
          connect={connect}
          isChangeIdentity={false}
          title="To continue, please connect to your CryptKeeper to continue."
        />
      </Box>
    );
  }

  <div>
    <h2>Start the Authorization Process</h2>

    <hr />

    <div>
      <h2>Example of Unauthorized Actions</h2>

      <br />

      <Semaphore genSemaphoreProof={genSemaphoreProof} />
    </div>

    <hr />

    <ToastContainer newestOnTop />
  </div>;

  return (
    <Box>
      <Grid container>
        <Grid xs={9}>
          <Header />
        </Grid>

        <Grid xs={4}>
          <Drawer />
        </Grid>

        <Grid xs={5}>
          <Container
            sx={{
              position: "absolute",
              top: 64,
            }}
          >
            <Grid container>
              <Grid xs={8}>
                <Box
                  className="popup"
                  sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "text.800",
                    border: "2px solid $gray-800",
                    width: "100%",
                    justifyContent: "center",
                    top: "64",
                  }}
                >
                  <Connect
                    isChangeIdentity
                    connect={connect}
                    sendCodeData={handleCodeFromActionBox}
                    title="Connect identity"
                  />

                  <ImportIdentity importIdentity={importIdentity} />

                  <GetMetadata getConnectedIdentityMetadata={getConnectedIdentityMetadata} />

                  <GetCommitment revealConnectedIdentityCommitment={revealConnectedIdentityCommitment} />

                  <DisplayCode code={codeData.code} isShowCode={codeData.isShowCode} />

                  <Semaphore genSemaphoreProof={genSemaphoreProof} />

                  <RateLimitingNullifier genRLNProof={genRLNProof} />

                  <Bandada generateGroupMerkleProof={generateGroupMerkleProof} joinGroup={joinGroup} />

                  <DisplayProof proof={proof} />

                  <VerifiableCredentials
                    addVerifiableCredentialRequest={addVerifiableCredentialRequest}
                    generateVerifiablePresentationRequest={generateVerifiablePresentationRequest}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Grid>

        <Grid xs={3}>
          <ConnectedIdentity
            identityCommitment={connectedCommitment}
            identityHost={connectedIdentityMetadata?.urlOrigin}
            identityName={connectedIdentityMetadata?.name}
          />
        </Grid>
      </Grid>

      <ToastContainer newestOnTop />
    </Box>
  );
};
