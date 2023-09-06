import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { FullModal, FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialItem } from "@src/ui/components/VerifiableCredential/Item";

export interface ISelectVerifiableCredentialProps {
  verifiablePresentationRequest?: string;
  cryptkeeperVerifiableCredentials: ICryptkeeperVerifiableCredential[];
  selectedVerifiableCredentialHashes: string[];
  error?: string;
  onCloseModal: () => void;
  onRejectVerifiablePresentationRequest: () => void;
  onToggleSelectVerifiableCredential: (hash: string) => void;
  onConfirmSelection: () => void;
}

const SelectVerifiableCredential = ({
  verifiablePresentationRequest = undefined,
  cryptkeeperVerifiableCredentials,
  selectedVerifiableCredentialHashes,
  error = undefined,
  onCloseModal,
  onRejectVerifiablePresentationRequest,
  onToggleSelectVerifiableCredential,
  onConfirmSelection,
}: ISelectVerifiableCredentialProps): JSX.Element => (
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
            onClick={onConfirmSelection}
          >
            Select
          </Button>
        </Box>
      </FullModalFooter>
    </FullModal>
  </Box>
);

export default SelectVerifiableCredential;
