import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { FullModal, FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialItem } from "@src/ui/components/VerifiableCredential/Item";

import { usePresentVerifiableCredential } from "./usePresentVerifiableCredential";

const PresentVerifiableCredential = (): JSX.Element => {
  const {
    verifiablePresentationRequest,
    cryptkeeperVerifiableCredentials,
    selectedVerifiableCredentialHashes,
    onCloseModal,
    onGenerateVerifiablePresentation,
    onRejectVerifiablePresentationRequest,
    onToggleSelectVerifiableCredential,
  } = usePresentVerifiableCredential();

  return (
    <Box sx={{ width: "100%", overflowX: "hidden", overflowY: "auto" }}>
      <FullModal data-testid="present-verifiable-credential-page" onClose={onCloseModal}>
        <FullModalHeader onClose={onCloseModal}>Request for Verifiable Credentials</FullModalHeader>

        <FullModalContent>
          <Typography>
            You have received a request to present Verifiable Credentials. Please select the Verifiable Credentials you
            want to share.
          </Typography>

          <Typography>Request: {verifiablePresentationRequest}</Typography>

          {cryptkeeperVerifiableCredentials.map(({ verifiableCredential, metadata }) => (
            <VerifiableCredentialItem
              key={metadata.hash}
              metadata={metadata}
              selected={selectedVerifiableCredentialHashes.includes(metadata.hash)}
              verifiableCredential={verifiableCredential}
              onToggleSelectVerifiableCredential={onToggleSelectVerifiableCredential}
            />
          ))}
        </FullModalContent>

        <FullModalFooter>
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button
              name="reject"
              sx={{ textTransform: "none" }}
              type="button"
              variant="outlined"
              onClick={onRejectVerifiablePresentationRequest}
            >
              Reject
            </Button>

            <Button
              name="confirm"
              sx={{ textTransform: "none" }}
              type="button"
              variant="contained"
              onClick={onGenerateVerifiablePresentation}
            >
              Confirm
            </Button>
          </Box>
        </FullModalFooter>
      </FullModal>
    </Box>
  );
};

export default PresentVerifiableCredential;
