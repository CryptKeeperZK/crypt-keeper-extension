import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { ToastContainer } from "react-toastify";

import ActionBox from "@src/components/ActionBox";
import Header from "@src/components/Header";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";

import { useVerifiableCredentials } from "./useVerifiableCredentials";
import { Footer } from "@src/components/Footer/Footer";

export const VerifiableCredentials = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { addVerifiableCredentialRequest, generateVerifiablePresentationRequest } = useVerifiableCredentials();

  const { fileContent: addVCCode } = useFileReader("addVC.ts");
  const { fileContent: generateVPCode } = useFileReader("generateVP.ts");

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
            <Typography variant="h6">Accepting Verifiable Credentials</Typography>

            <ActionBox<string, void>
              code={addVCCode}
              option="UniversityDegreeCredential"
              testId="add-verifiable-credential"
              title="Add a University Degree Verifiable Credential"
              onClick={addVerifiableCredentialRequest}
            />

            <ActionBox<string, void>
              code={generateVPCode}
              option="DriversLicenseCredential"
              testId="add-verifiable-credential"
              title="Add a Drivers License Verifiable Credential"
              onClick={addVerifiableCredentialRequest}
            />

            <ActionBox<undefined, void>
              code={generateVPCode}
              option={undefined}
              testId="add-verifiable-credential"
              title="Generate a Verifiable Presentation"
              onClick={generateVerifiablePresentationRequest}
            />
            <Footer />
          </Box>
        </Container>
      </Box>

      <ToastContainer newestOnTop />
    </Box>
  );
};

export default VerifiableCredentials;
