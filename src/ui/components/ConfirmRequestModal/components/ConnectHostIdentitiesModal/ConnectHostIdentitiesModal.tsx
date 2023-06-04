import { PendingRequest } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Checkbox } from "@src/ui/components/Checkbox";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

import "../../confirmModal.scss";

import { useConnectHostIdentitiesModal } from "./useConnectHostIdentitiesModal";
import { IdentitiesContent } from "@src/ui/components/IdentitiesContent";
import { useEffect } from "react";

export interface ConnectionApprovalModalProps {
  pendingRequest: PendingRequest<{ host: string }>;
  accept: () => void;
}

export const ConnectHostIdentitiesModal = ({ pendingRequest, accept }: ConnectionApprovalModalProps): JSX.Element => {
  const { availableHostIdentities, host, faviconUrl, onCreateIdentityRequest } = useConnectHostIdentitiesModal({
    pendingRequest,
  });

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
          This site is already attached to {availableHostIdentities.length} identities. Please choose one to connect
          with, or choose to create a new identity.
        </div>
        <IdentitiesContent identities={availableHostIdentities} host={host} isShowSettings={false} accept={accept} />
      </FullModalContent>

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} onClick={() => console.log("Help")}>
            Reject
        </Button>

        <Button className="ml-2" onClick={onCreateIdentityRequest}>
            Create new identity
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
