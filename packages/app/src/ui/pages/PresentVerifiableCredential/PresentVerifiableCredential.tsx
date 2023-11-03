import InfoIcon from "@mui/icons-material/Info";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { DropdownButton } from "@src/ui/components/DropdownButton";
import { FullModalHeader, FullModalContent, FullModalFooter } from "@src/ui/components/FullModal";
import { VerifiableCredentialItem } from "@src/ui/components/VerifiableCredential/Item";

import { usePresentVerifiableCredential } from "./usePresentVerifiableCredential";

const PresentVerifiableCredential = (): JSX.Element => {
  const {
    isWalletConnected,
    isWalletInstalled,
    vpRequest,
    cryptkeeperVCs,
    selectedVCHashes,
    error,
    checkDisabledItem,
    onCloseModal,
    onReject,
    onSelect,
    onSubmit,
  } = usePresentVerifiableCredential();

  const ethTitle = isWalletConnected ? "Sign with MetaMask" : "Connect to MetaMask";
  const menuOptions = [
    {
      id: "metamask",
      title: isWalletInstalled ? ethTitle : "Install Metamask",
      checkDisabledItem,
    },
    {
      id: "cryptkeeper",
      title: "Sign with CryptKeeper",
      checkDisabledItem,
    },
    {
      id: "empty",
      title: "Proceed without Signing",
      checkDisabledItem,
    },
  ];

  return (
    <Box
      data-testid="select-verifiable-credential-page"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <FullModalHeader onClose={onCloseModal}>Request for Verifiable Credentials</FullModalHeader>

      <FullModalContent>
        <Typography sx={{ textAlign: "center" }}>
          You have received a request to present Verifiable Credentials:
        </Typography>

        <Typography sx={{ textAlign: "center" }}>{vpRequest}</Typography>

        {cryptkeeperVCs.map(({ verifiableCredential, metadata }) => (
          <VerifiableCredentialItem
            key={metadata.hash}
            metadata={metadata}
            selected={selectedVCHashes.includes(metadata.hash)}
            verifiableCredential={verifiableCredential}
            onSelect={onSelect}
          />
        ))}
      </FullModalContent>

      {error && (
        <Typography color="error.main" fontSize="xs" sx={{ pb: 1 }} textAlign="center">
          {error}
        </Typography>
      )}

      <Box sx={{ p: "1rem", mt: "1rem", display: "flex", alignItems: "center" }}>
        <Typography sx={{ mr: 1, textAlign: "center" }}>Choose Verifiable Credential signer</Typography>

        <Tooltip
          followCursor
          title="Choose method of signing Verifiable Credentials. You may use your CryptKeeper keys, connected MetaMask, or send them unsigned."
        >
          <InfoIcon />
        </Tooltip>
      </Box>

      <FullModalFooter>
        <Box
          sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%", height: "100%" }}
        >
          <Button
            data-testid="reject-verifiable-presentation-request"
            name="reject"
            size="small"
            sx={{ textTransform: "none", flex: 1, mr: 1, width: "30%" }}
            type="submit"
            variant="outlined"
            onClick={onReject}
          >
            Reject
          </Button>

          <DropdownButton options={menuOptions} onClick={onSubmit} />
        </Box>
      </FullModalFooter>
    </Box>
  );
};

export default PresentVerifiableCredential;
