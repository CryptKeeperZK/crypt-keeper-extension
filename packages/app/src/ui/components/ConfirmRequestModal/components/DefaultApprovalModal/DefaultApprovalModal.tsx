import { PendingRequest } from "@cryptkeeperzk/types";

import { ButtonType, Button } from "@src/ui/components/Button";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";

import "../../confirmModal.scss";

export interface DefaultApprovalModalProps {
  len: number;
  loading: boolean;
  error: string;
  pendingRequest?: PendingRequest;
  accept: () => void;
  reject: () => void;
}

export const DefaultApprovalModal = ({
  len,
  loading,
  error,
  pendingRequest = undefined,
  accept,
  reject,
}: DefaultApprovalModalProps): JSX.Element => (
  <FullModal className="confirm-modal" data-testid="default-approval-modal" onClose={reject}>
    <FullModalHeader>
      Unhandled Request
      {len > 1 && <div className="flex-grow flex flex-row justify-end">{`1 of ${len}`}</div>}
    </FullModalHeader>

    <FullModalContent className="flex flex-col">
      <div className="text-sm font-semibold mb-2 break-all">{JSON.stringify(pendingRequest || {})}</div>
    </FullModalContent>

    {error && <div className="text-xs text-red-500 text-center pb-1">{error}</div>}

    <FullModalFooter>
      <Button buttonType={ButtonType.SECONDARY} loading={loading} onClick={reject}>
        Reject
      </Button>

      <Button disabled className="ml-2" loading={loading} onClick={accept}>
        Approve
      </Button>
    </FullModalFooter>
  </FullModal>
);
