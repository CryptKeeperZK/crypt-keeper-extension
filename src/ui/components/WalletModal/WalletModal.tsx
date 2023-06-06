import { Typography, Tooltip, Button } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { BaseSyntheticEvent, MouseEvent as ReactMouseEvent, useCallback } from "react";

import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";

import { style } from "./style";
import { setConnectedIdentity, useSelectedToConnect } from "@src/ui/ducks/identities";
import { useAppDispatch } from "@src/ui/ducks/hooks";

export interface BasicModalProps {
  host?: string;
  isOpenModal: boolean;
  isLoading: boolean;
  isWalletConnected: boolean;
  isWalletInstalled: boolean;
  onConnectWallet: () => Promise<void>;
  onCreateWithEthWallet: (event?: BaseSyntheticEvent) => Promise<void>;
  onCreateWithCryptkeeper: (event?: BaseSyntheticEvent) => Promise<void>;
  accept?: () => void;
  reject: (event: ReactMouseEvent) => void;
}

// TODO: replace wallet names with icons
export const WalletModal = ({
  host,
  isOpenModal,
  isLoading,
  isWalletConnected,
  isWalletInstalled,
  onConnectWallet,
  onCreateWithEthWallet,
  onCreateWithCryptkeeper,
  reject,
  accept,
}: BasicModalProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const selectedToConnect = useSelectedToConnect();

  const ethWalletTitle = isWalletConnected ? "Metamask" : "Connect to Metamask";

  const handleConnection = useCallback(async () => {
    if (accept) {
      //await dispatch(setConnectedIdentity(selectedToConnect.commitment, selectedToConnect.host));
      accept();
    }
    return;
  }, [accept]);

  const handleCreateWithEthWallet = useCallback(async () => {
    await onCreateWithEthWallet();
    await handleConnection();
  }, [accept, onConnectWallet]);

  const handleCreateWithCryptKeeper = useCallback(async () => {
    await onCreateWithCryptkeeper();
    await handleConnection();
  }, [accept]);

  return (
    <Modal
      aria-describedby="modal-modal-description"
      aria-labelledby="modal-modal-title"
      data-testid="danger-modal"
      open={isOpenModal}
    >
      <Box sx={style}>
        <FullModalHeader>Sign your identity</FullModalHeader>

        <FullModalContent className="flex flex-col items-center">
          <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 1 }}>
              {host
                ? `Choose wallet to create a new identity for ${host} `
                : `Choose wallet to create a new random identity`}
            </Typography>

            <Tooltip
              followCursor
              title="Identity creation can be done with your Cryptkeeper keys or with connected Ethereum wallet."
            >
              <Icon fontAwesome="fa-info" />
            </Tooltip>
          </Box>

          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", width: "100%" }}>
            <Button
              disabled={isLoading || !isWalletInstalled}
              name="metamask"
              sx={{ textTransform: "none" }}
              type="submit"
              variant="outlined"
              onClick={isWalletConnected ? handleCreateWithEthWallet : onConnectWallet}
            >
              {isWalletInstalled ? ethWalletTitle : "Install Metamask"}
            </Button>

            <Button
              disabled={isLoading}
              name="cryptkeeper"
              sx={{ textTransform: "none" }}
              type="submit"
              variant="outlined"
              onClick={handleCreateWithCryptKeeper}
            >
              Cryptkeeper
            </Button>
          </Box>
        </FullModalContent>

        <FullModalFooter>
          <Button
            disabled={isLoading}
            name="close"
            sx={{ textTransform: "none" }}
            type="submit"
            variant="contained"
            onClick={reject}
          >
            Close
          </Button>
        </FullModalFooter>
      </Box>
    </Modal>
  );
};
