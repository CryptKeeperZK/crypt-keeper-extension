import { ButtonType, Button } from "@src/ui/components/Button";
import { Checkbox } from "@src/ui/components/Checkbox";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";

import { usePermissionModal } from "./usePermissionModal";

export interface IPermissionModalProps {
  refreshConnectionStatus: () => Promise<void>;
  onClose: () => void;
}

export const PermissionModal = ({ refreshConnectionStatus, onClose }: IPermissionModalProps): JSX.Element => {
  const { url, checked, faviconUrl, onRemoveHost, onSetApproval } = usePermissionModal({
    refreshConnectionStatus,
    onClose,
  });

  return (
    <FullModal data-testid="connection-modal" onClose={onClose}>
      <FullModalHeader onClose={onClose}>
        {url?.protocol.includes("extension:") ? "Chrome Extension Page" : url?.origin}
      </FullModalHeader>

      <FullModalContent className="flex flex-col items-center">
        {url?.protocol.includes("extension:") ? (
          <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0 flex flex-row items-center justify-center">
            <Icon className="text-gray-700" fontAwesome="fas fa-tools" size={1.5} />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full my-6 border border-gray-800 p-2 flex-shrink-0 flex flex-row items-center justify-center">
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
        )}

        <div className="font-bold">Permissions</div>

        <div className="flex flex-row items-start">
          <Checkbox checked={checked} className="mr-2 mt-2 flex-shrink-0" id="approval" onChange={onSetApproval} />

          <label className="text-sm mt-2" htmlFor="approval">
            Allow urlOrigin to create proof without approvals
          </label>
        </div>
      </FullModalContent>

      <FullModalFooter className="justify-center">
        <Button buttonType={ButtonType.SECONDARY} className="ml-2" onClick={onRemoveHost}>
          Disconnect
        </Button>

        <Button className="ml-2" onClick={onClose}>
          Close
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
