import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

import { useAddVerifiableCredential } from "./useAddVerifiableCredential";
import { VerifiableCredentialDisplay } from "@src/ui/components/VerifiableCredentialList";

const AddVerifiableCredential = (): JSX.Element => {
  const {
    closeModal,
    serializedVerifiableCredential,
    onApproveAddVerifiableCredential,
    onRejectAddVerifiableCredential,
  } = useAddVerifiableCredential();

  const isError = !serializedVerifiableCredential;

  return (
    <FullModal data-testid="add-verifiable-credential-page" onClose={closeModal}>
      <FullModalHeader onClose={closeModal}>Add Verifiable Credential</FullModalHeader>

      <FullModalContent>
        <Typography>You have received a request to add a Verifiable Credential to your wallet:</Typography>
        {isError ? (
          <Typography>There was an error retrieving the Verifiable Credential.</Typography>
        ) : (
          <VerifiableCredentialDisplay serializedVerifiableCredential={serializedVerifiableCredential} />
        )}
      </FullModalContent>

      <FullModalFooter>
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button
            disabled={isError}
            name="reject"
            sx={{ textTransform: "none" }}
            type="button"
            variant="outlined"
            onClick={onRejectAddVerifiableCredential}
          >
            Reject Request
          </Button>

          <Button
            disabled={isError}
            name="approve"
            sx={{ textTransform: "none" }}
            type="button"
            variant="contained"
            onClick={onApproveAddVerifiableCredential}
          >
            Accept Request
          </Button>
        </Box>
      </FullModalFooter>
    </FullModal>
  );
};

export default AddVerifiableCredential;
