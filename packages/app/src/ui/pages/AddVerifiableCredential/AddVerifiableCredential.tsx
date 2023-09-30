import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { FullModal, FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialDisplay } from "@src/ui/components/VerifiableCredential";

import { useAddVerifiableCredential } from "./useAddVerifiableCredential";

const AddVerifiableCredential = (): JSX.Element => {
  const { cryptkeeperVC, error, onCloseModal, onRename, onApprove, onReject } = useAddVerifiableCredential();

  const isError = !cryptkeeperVC;

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "hidden",
        overflowY: "auto",
        scrollbarWidth: "none",

        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <FullModal data-testid="add-verifiable-credential-page" onClose={onCloseModal}>
        <FullModalHeader onClose={onCloseModal}>Add Verifiable Credential</FullModalHeader>

        <FullModalContent>
          <Typography>You have received a request to add a Verifiable Credential to your wallet:</Typography>

          {cryptkeeperVC ? (
            <VerifiableCredentialDisplay cryptkeeperVC={cryptkeeperVC} onRenameVC={onRename} />
          ) : (
            <Typography>There was an error retrieving the Verifiable Credential.</Typography>
          )}
        </FullModalContent>

        {error && (
          <Typography color="error.main" fontSize="xs" sx={{ pb: 1 }} textAlign="center">
            {error}
          </Typography>
        )}

        <FullModalFooter>
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button
              disabled={isError}
              name="reject"
              sx={{ textTransform: "none" }}
              type="button"
              variant="outlined"
              onClick={onReject}
            >
              Reject
            </Button>

            <Button
              disabled={isError}
              name="approve"
              sx={{ textTransform: "none" }}
              type="button"
              variant="contained"
              onClick={onApprove}
            >
              Accept
            </Button>
          </Box>
        </FullModalFooter>
      </FullModal>
    </Box>
  );
};

export default AddVerifiableCredential;
