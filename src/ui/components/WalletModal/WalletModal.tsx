import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

import { style } from "./style";
import { Typography, Tooltip, Button } from "@mui/material";
import { Icon } from "@src/ui/components/Icon";
import { ButtonType, Button as CustomButton } from "@src/ui/components/Button";
import { BaseSyntheticEvent } from "react";

export interface BasicModalProps {
  host?: string;
  isOpenModal: boolean;
  isLoading: boolean;
  isWalletConnected: boolean;
  isWalletInstalled: boolean;
  onConnectWallet: () => Promise<void>;
  onCreateWithEthWallet: (event?: BaseSyntheticEvent) => Promise<void>;
  onCreateWithCryptkeeper: (event?: BaseSyntheticEvent) => Promise<void>;
  reject: () => void;
}

export const WalletModal = ({ host, isOpenModal, isLoading, isWalletConnected, isWalletInstalled, onConnectWallet, onCreateWithEthWallet, onCreateWithCryptkeeper, reject }: BasicModalProps): JSX.Element => {
  const ethWalletTitle = isWalletConnected ? "Metamask" : "Connect to Metamask";
  
  return (
    <Modal
      aria-describedby="modal-modal-description"
      aria-labelledby="modal-modal-title"
      data-testid="danger-modal"
      open={isOpenModal}
    >
      <Box sx={style}>
        <FullModalHeader>Supported Wallets</FullModalHeader>

        <FullModalContent className="flex flex-col items-center">
          <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
            <Typography sx={{ mr: 1 }}>
              {host ? 
                (`Choose wallet to create a new identity for ${host} `)
              : 
                (`Choose wallet to create a new random identity`)
              }
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
              variant="contained"
              onClick={isWalletConnected ? onCreateWithEthWallet : onConnectWallet}
            >
              {isWalletInstalled ? ethWalletTitle : "Install Metamask"}
            </Button>

            <Button
              disabled={isLoading}
              name="cryptkeeper"
              sx={{ textTransform: "none" }}
              type="submit"
              variant="contained"
              onClick={onCreateWithCryptkeeper}
            >
              Cryptkeeper
            </Button>
          </Box>
        </FullModalContent>

        <FullModalFooter>
          <CustomButton buttonType={ButtonType.SECONDARY} data-testid="danger-modal-reject" onClick={reject}>
            Reject
          </CustomButton>
      </FullModalFooter>
      </Box>
    </Modal>
  )
};
