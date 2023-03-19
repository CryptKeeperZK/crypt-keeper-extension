import { PendingRequest } from "@src/types";
import { ButtonType, Button } from "@src/ui/components/Button";
import { Checkbox } from "@src/ui/components/Checkbox";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

import "../../confirm-modal.scss";

import { useConnectionApprovalModal } from "./useConnectionApprovalModal";

export interface ConnectionApprovalModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest: PendingRequest<{ origin: string }>;
  accept: () => void;
  reject: () => void;
}

export const ConnectionApprovalModal = ({
  len,
  pendingRequest,
  error,
  loading,
  accept,
  reject,
}: ConnectionApprovalModalProps): JSX.Element => {
  const { checked, host, faviconUrl, onAccept, onReject, onSetApproval } = useConnectionApprovalModal({
    pendingRequest,
    accept,
    reject,
  });

  return (
    <FullModal className="confirm-modal" data-testid="approval-modal" onClose={onReject}>
      <FullModalHeader>
        Connect with CryptKeeper
        {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
      </FullModalHeader>

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
          This site is requesting access to view your current identity. Always make sure you trust the site you interact
          with.
        </div>

        <div className="font-bold mt-4">Permissions</div>

        <div className="flex flex-row items-start">
          <Checkbox checked={checked} className="mr-2 mt-2 flex-shrink-0" id="approval" onChange={onSetApproval} />

          <label className="text-sm mt-2" htmlFor="approval">
            Allow host to create proof without approvals
          </label>
        </div>
      </FullModalContent>

      {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

      <FullModalFooter>
        <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={onReject}>
          Reject
        </Button>

        <Button className="ml-2" loading={loading} onClick={onAccept}>
          Approve
        </Button>
      </FullModalFooter>
    </FullModal>
  );
};
