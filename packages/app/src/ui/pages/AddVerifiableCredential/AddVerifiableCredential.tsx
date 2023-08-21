import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { FullModal, FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialDisplay } from "@src/ui/components/VerifiableCredential";

import { useAddVerifiableCredential } from "./useAddVerifiableCredential";

const AddVerifiableCredential = (): JSX.Element => {
  const {
    cryptkeeperVerifiableCredential,
    error,
    onCloseModal,
    onRenameVerifiableCredential,
    onApproveVerifiableCredential,
    onRejectVerifiableCredential,
  } = useAddVerifiableCredential();

  const isError = !cryptkeeperVerifiableCredential;

  return (
    <FullModal data-testid="add-verifiable-credential-page" onClose={onCloseModal}>
      <FullModalHeader onClose={onCloseModal}>Add Verifiable Credential</FullModalHeader>

      <FullModalContent>
        <Typography>You have received a request to add a Verifiable Credential to your wallet:</Typography>

        {cryptkeeperVerifiableCredential ? (
          <VerifiableCredentialDisplay
            cryptkeeperVerifiableCredential={cryptkeeperVerifiableCredential}
            onRenameVerifiableCredential={onRenameVerifiableCredential}
          />
        ) : (
          <Typography>There was an error retrieving the Verifiable Credential.</Typography>
        )}
      </FullModalContent>

      {error && <Typography className="text-xs text-red-500 text-center pb-1">{error}</Typography>}

      <FullModalFooter>
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button
            disabled={isError}
            name="reject"
            sx={{ textTransform: "none" }}
            type="button"
            variant="outlined"
            onClick={onRejectVerifiableCredential}
          >
            Reject
          </Button>

          <Button
            disabled={isError}
            name="approve"
            sx={{ textTransform: "none" }}
            type="button"
            variant="contained"
            onClick={onApproveVerifiableCredential}
          >
            Accept
          </Button>
        </Box>
      </FullModalFooter>
    </FullModal>
  );
};

export default AddVerifiableCredential;
