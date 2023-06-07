import { PendingRequest } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

import "../../confirmModal.scss";
import { useCreateIdentity } from "../CreateIdentityModal/useCreateIdentity";

import { useConnectHostIdentitiesModal } from "./useConnectHostIdentitiesModal";

import { IdentitiesContent } from "@src/ui/components/IdentitiesContent";
import { ConnectTabList } from "@src/ui/components/ConnectTabList ";
import { WalletModal } from "@src/ui/components/WalletModal";
import { AddButton } from "@src/ui/components/AddButton";

export interface ConnectionApprovalModalProps {
  pendingRequest: PendingRequest<{ host: string }>;
  accept: () => void;
  reject: () => void;
}

export const ConnectHostIdentitiesModal = ({
  pendingRequest,
  accept,
  reject,
}: ConnectionApprovalModalProps): JSX.Element => {
  const {
    isWalletModalOpen,
    isLoading,
    isWalletConnected,
    isWalletInstalled,
    onConnectWallet,
    onCreateWithEthWallet,
    onCreateWithCryptkeeper,
    onWalletModalShow,
  } = useCreateIdentity({ pendingRequest, accept });

  const { hostIdentities, randomIdentities, host, notReadyToConnect, faviconUrl, onReject, handleConnectIdentity } =
    useConnectHostIdentitiesModal({
      pendingRequest,
      onWalletModalShow,
      accept,
      reject,
    });

  return (
    <FullModal className="confirm-modal" data-testid="approval-modal" onClose={onReject}>
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

        <ConnectTabList isShowTabs={hostIdentities.length > 0 && randomIdentities.length > 0}>
          <IdentitiesContent
            host={host}
            identities={hostIdentities}
            isDisableCheckClick={false}
            isShowSettings={false}
          />

          <IdentitiesContent
            host={host}
            identities={randomIdentities}
            isDisableCheckClick={false}
            isShowSettings={false}
          />
        </ConnectTabList>

        <AddButton title="Create a new Identity and Connect" action={onWalletModalShow} />
      </FullModalContent>

      <FullModalFooter>
        <WalletModal
          accept={accept}
          host={host}
          isLoading={isLoading}
          isOpenModal={isWalletModalOpen}
          isWalletConnected={isWalletConnected}
          isWalletInstalled={isWalletInstalled}
          reject={onWalletModalShow}
          onConnectWallet={onConnectWallet}
          onCreateWithCryptkeeper={onCreateWithCryptkeeper}
          onCreateWithEthWallet={onCreateWithEthWallet}
        />
        <Button buttonType={ButtonType.SECONDARY} onClick={onReject}>
          Reject
        </Button>

        <Button disabled={notReadyToConnect} className="ml-2" onClick={handleConnectIdentity}>
          Connect
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
