import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { FullModal, FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialItem } from "@src/ui/components/VerifiableCredential/Item";

export interface IVerifiableCredentialSelectorProps {
  verifiablePresentationRequest?: string;
  cryptkeeperVerifiableCredentials: ICryptkeeperVerifiableCredential[];
  selectedVerifiableCredentialHashes: string[];
  error?: string;
  onCloseModal: () => void;
  onRejectVerifiablePresentationRequest: () => void;
  onToggleSelectVerifiableCredential: (hash: string) => void;
  onConfirmSelection: () => void;
}

const VerifiableCredentialSelector = ({
  verifiablePresentationRequest = undefined,
  cryptkeeperVerifiableCredentials,
  selectedVerifiableCredentialHashes,
  error = undefined,
  onCloseModal,
  onRejectVerifiablePresentationRequest,
  onToggleSelectVerifiableCredential,
  onConfirmSelection,
}: IVerifiableCredentialSelectorProps): JSX.Element => (
  <Box sx={{ width: "100%", overflowX: "hidden", overflowY: "auto" }}>
    <FullModal data-testid="select-verifiable-credential-page" onClose={onCloseModal}>
      <FullModalHeader onClose={onCloseModal}>Request for Verifiable Credentials</FullModalHeader>

      <FullModalContent>
        <Typography sx={{ textAlign: "center" }}>
          You have received a request to present Verifiable Credentials:
        </Typography>

        <Typography sx={{ textAlign: "center" }}>{verifiablePresentationRequest}</Typography>

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

      {error && (
        <Typography color="error.main" fontSize="xs" sx={{ pb: 1 }} textAlign="center">
          {error}
        </Typography>
      )}

      <FullModalFooter>
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button
            data-testid="reject-verifiable-presentation-request"
            name="reject"
            size="small"
            sx={{ textTransform: "none", flex: 1, mr: 1 }}
            type="submit"
            variant="outlined"
            onClick={onRejectVerifiablePresentationRequest}
          >
            Reject
          </Button>

          <Button
            data-testid="confirm-verifiable-presentation-request"
            name="confirm"
            size="small"
            sx={{ textTransform: "none", flex: 1, ml: 1 }}
            type="submit"
            variant="contained"
            onClick={onConfirmSelection}
          >
            Select
          </Button>
        </Box>
      </FullModalFooter>
    </FullModal>
  </Box>
);

export default VerifiableCredentialSelector;
