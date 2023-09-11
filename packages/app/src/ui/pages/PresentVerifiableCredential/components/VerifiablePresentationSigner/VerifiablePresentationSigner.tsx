import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { ICryptkeeperVerifiableCredential } from "@src/types";
import { FullModal, FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialItem } from "@src/ui/components/VerifiableCredential/Item";

export interface IVerifiablePresentationSignerProps {
  isWalletConnected: boolean;
  isWalletInstalled: boolean;
  cryptkeeperVerifiableCredentials: ICryptkeeperVerifiableCredential[];
  selectedVerifiableCredentialHashes: string[];
  onCloseModal: () => void;
  onReturnToSelection: () => void;
  onConnectWallet: () => Promise<void>;
  onSubmitWithSignature: () => void;
  onSubmitWithoutSignature: () => void;
}

const VerifiablePresentationSigner = ({
  isWalletConnected,
  isWalletInstalled,
  cryptkeeperVerifiableCredentials,
  selectedVerifiableCredentialHashes,
  onCloseModal,
  onReturnToSelection,
  onConnectWallet,
  onSubmitWithSignature,
  onSubmitWithoutSignature,
}: IVerifiablePresentationSignerProps): JSX.Element => {
  const selectedVerifableCredentials = cryptkeeperVerifiableCredentials.filter(({ metadata }) =>
    selectedVerifiableCredentialHashes.includes(metadata.hash),
  );

  const ethWalletTitle = isWalletConnected ? "Metamask" : "Connect to Metamask";

  return (
    <Box sx={{ width: "100%", overflowX: "hidden", overflowY: "auto" }}>
      <FullModal data-testid="sign-verifiable-credential-page" onClose={onCloseModal}>
        <FullModalHeader onClose={onReturnToSelection}>Sign Verifiable Presentation</FullModalHeader>

        <FullModalContent>
          <Typography sx={{ textAlign: "center" }}>
            You have selected the following Verifiable Credentials. You may now sign them with your Metamask wallet, or
            send them unsigned.
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
              data-testid="sign-verifiable-presentation-metamask"
              disabled={!isWalletInstalled}
              name="metamask"
              size="small"
              sx={{ textTransform: "none", flex: 1, mr: 1 }}
              type="submit"
              variant="outlined"
              onClick={isWalletConnected ? onSubmitWithSignature : onConnectWallet}
            >
              {isWalletInstalled ? ethWalletTitle : "Install MetaMask"}
            </Button>

            <Button
              data-testid="submit-verifiable-presentation-without-signing"
              name="cryptkeeper"
              size="small"
              sx={{ textTransform: "none", flex: 1, ml: 1 }}
              type="submit"
              variant="contained"
              onClick={onSubmitWithoutSignature}
            >
              Proceed Without Signing
            </Button>
          </Box>
        </FullModalFooter>
      </FullModal>
    </Box>
  );
};

export default VerifiablePresentationSigner;
