import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { CryptkeeperVerifiableCredential } from "@src/types";
import { FullModal, FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialItem } from "@src/ui/components/VerifiableCredential/Item";

export interface ISignVerifiablePresentationProps {
  cryptkeeperVerifiableCredentials: CryptkeeperVerifiableCredential[];
  selectedVerifiableCredentialHashes: string[];
  onCloseModal: () => void;
  onReturnToSelection: () => void;
  onGenerateVerifiablePresentation: () => void;
}

const SignVerifiablePresentation = ({
  cryptkeeperVerifiableCredentials,
  selectedVerifiableCredentialHashes,
  onCloseModal,
  onReturnToSelection,
  onGenerateVerifiablePresentation,
}: ISignVerifiablePresentationProps): JSX.Element => {
  const selectedVerifableCredentials = cryptkeeperVerifiableCredentials.filter(({ metadata }) =>
    selectedVerifiableCredentialHashes.includes(metadata.hash),
  );

  return (
    <Box sx={{ width: "100%", overflowX: "hidden", overflowY: "auto" }}>
      <FullModal data-testid="present-verifiable-credential-page" onClose={onCloseModal}>
        <FullModalHeader onClose={onReturnToSelection}>Sign Verifiable Presentation</FullModalHeader>

        <FullModalContent>
          <Typography sx={{ textAlign: "center" }}>
            You have selected the following Verifiable Credentials. Please sign them to proceed.
          </Typography>

          {selectedVerifableCredentials.map(({ verifiableCredential, metadata }) => (
            <VerifiableCredentialItem
              key={metadata.hash}
              metadata={metadata}
              verifiableCredential={verifiableCredential}
            />
          ))}
        </FullModalContent>

        <FullModalFooter>
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button
              name="confirm"
              sx={{ textTransform: "none" }}
              type="button"
              variant="contained"
              onClick={onGenerateVerifiablePresentation}
            >
              Sign with Metamask
            </Button>

            <Button
              name="confirm"
              sx={{ textTransform: "none" }}
              type="button"
              variant="contained"
              onClick={onGenerateVerifiablePresentation}
            >
              Proceed Without Signing
            </Button>
          </Box>
        </FullModalFooter>
      </FullModal>
    </Box>
  );
};

export default SignVerifiablePresentation;
