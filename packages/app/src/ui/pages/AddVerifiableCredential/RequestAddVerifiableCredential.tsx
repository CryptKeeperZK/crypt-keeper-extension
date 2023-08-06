import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialDisplay } from "@src/ui/components/VerifiableCredential";

export interface RequestAddVerifiableCredentialProps {
  serializedVerifiableCredential: string;
  onAddVerifiableCredential: () => Promise<void>;
  onRejectAddVerifiableCredential: () => void;
}

const RequestAddVerifiableCredential = ({
  serializedVerifiableCredential,
  onAddVerifiableCredential,
  onRejectAddVerifiableCredential,
}: RequestAddVerifiableCredentialProps): JSX.Element => {
  const isError = !serializedVerifiableCredential;

  return (
    <>
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
            onClick={onAddVerifiableCredential}
          >
            Accept Request
          </Button>
        </Box>
      </FullModalFooter>
    </>
  );
};

export default RequestAddVerifiableCredential;
