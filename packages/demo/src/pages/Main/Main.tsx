import { Navigate, RouteObject, useRoutes } from "react-router-dom";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ToastContainer } from "react-toastify";

import Bandada from "@src/components/Bandada";
import ConnectedIdentity from "@src/components/ConnectedIdentity";
import DisplayCode, { type IDisplayCodeProps } from "@src/components/DisplayCode";
import DisplayProof from "@src/components/DisplayProof";
import GetCommitment from "@src/components/GetCommitment";
import Header from "@src/components/Header";
import RateLimitingNullifier from "@src/components/RateLimitingNullifier";
import Semaphore from "@src/components/Semaphore";
import VerifiableCredentials from "@src/components/VerifiableCredentials";
import { useCryptKeeper } from "@src/hooks/useCryptKeeper";
import RightSideBar from "@src/components/RightSideBar";
import { Paths } from "@src/constants";
import Connect from "@src/pages/Connect";
import IdentityMetadata from "@src/pages/IdentityMetadata";
import ImportIdentity from "@src/pages/ImportIdentity";

const routeConfig: RouteObject[] = [
  { path: Paths.CONNECT, element: <Connect /> },
  { path: Paths.GET_IDENTITY_METADATA, element: <IdentityMetadata />}
  { path: Paths.IMPORT_IDENTITY, element: <ImportIdentity />}
];

export const Main = (): JSX.Element => {
  const routes = useRoutes(routeConfig);

  const {
    genSemaphoreProof,
    genRLNProof,
    addVerifiableCredentialRequest,
    generateVerifiablePresentationRequest,
    revealConnectedIdentityCommitment,
    joinGroup,
    generateGroupMerkleProof,
  } = useCryptKeeper();

  // if (isLocked) {
  //   return (
  //     <Box sx={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", height: "100%" }}>
  //       <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3, flexGrow: 1 }}>
  //         <LockOpenIcon color="primary" fontSize="inherit" />

  //         <Typography sx={{ pt: 3, fontWeight: "bold", color: "primary.main" }} variant="h4">
  //           Welcome to CryptKeeper Demo!
  //         </Typography>
  //       </Box>

  //       <ConnectToCK
  //         connect={connect}
  //         isChangeIdentity={false}
  //         title=""
  //       />
  //     </Box>
  //   );
  // }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header */}
      <Header />

      {/* Center Content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {routes}

        {/* <Container sx={{ flex: 1, position: "relative", top: 64 }}>
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
        </Container> */}
      </Box>

      {/* RightSideBar */}
      <RightSideBar>
        <ConnectedIdentity />
      </RightSideBar>

      <ToastContainer newestOnTop />
    </Box>
  );
};
