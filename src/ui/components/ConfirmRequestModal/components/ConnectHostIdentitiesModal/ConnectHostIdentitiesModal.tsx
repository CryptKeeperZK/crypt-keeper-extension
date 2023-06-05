import { PendingRequest } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Checkbox } from "@src/ui/components/Checkbox";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

import "../../confirmModal.scss";

import { useConnectHostIdentitiesModal } from "./useConnectHostIdentitiesModal";
import { IdentitiesContent } from "@src/ui/components/IdentitiesContent";
import { useEffect } from "react";
import { ConnectTabList } from "@src/ui/components/ConnectTabList ";
import { WalletModal } from "@src/ui/components/WalletModal";
import { useCreateIdentity } from "../CreateIdentityModal/useCreateIdentity";

export interface ConnectionApprovalModalProps {
  pendingRequest: PendingRequest<{ host: string }>;
  accept: () => void;
  reject: () => void;
}

export const ConnectHostIdentitiesModal = ({ pendingRequest, accept, reject }: ConnectionApprovalModalProps): JSX.Element => {
  const { hostIdentities, randomIdentities, host, faviconUrl, onReject } = useConnectHostIdentitiesModal({
    pendingRequest,
    reject
  });

  const { isWalletModalOpen, isLoading, isWalletConnected, isWalletInstalled, onConnectWallet, onCreateWithEthWallet, onCreateWithCryptkeeper, onWalletModalShow } = useCreateIdentity({ pendingRequest, accept })

  return (
    <FullModal className="confirm-modal" data-testid="approval-modal" onClose={() => console.log("hi")}>
      {host && <FullModalHeader>Connect to `{host}`</FullModalHeader>}

      <FullModalContent className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0">
          <div
            className="w-16 h-16"
            style={{
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundImage: `url(${faviconUrl})`,
            }}
          />
        </div>

        <div className="text-lg font-semibold mb-2 text-center">{`${host} would like to connect to your identity`}</div>

        <div className="text-sm text-gray-500 text-center">
          Please choose one to connect with, or choose to create a new identity.
        </div>

        <ConnectTabList>
          <IdentitiesContent identities={hostIdentities} host={host} isShowSettings={false} isDisableCheckClick={false} accept={accept} />
          <IdentitiesContent identities={randomIdentities} host={host} isShowSettings={false} isDisableCheckClick={false} accept={accept} />
        </ConnectTabList>
      </FullModalContent>

      <FullModalFooter>
        <WalletModal host={host} isOpenModal={isWalletModalOpen} isLoading={isLoading} isWalletConnected={isWalletConnected} isWalletInstalled={isWalletInstalled} onConnectWallet={onConnectWallet} onCreateWithEthWallet={onCreateWithEthWallet} onCreateWithCryptkeeper={onCreateWithCryptkeeper} reject={onWalletModalShow} />

        <Button buttonType={ButtonType.SECONDARY} onClick={onReject}>
          Reject
        </Button>

        <Button className="ml-2" onClick={onWalletModalShow}>
          Create new identity
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
