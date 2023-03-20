import { PendingRequest, PendingRequestType, ProofPayload } from "@src/types";

import { ProofModal, ConnectionApprovalModal, DefaultApprovalModal } from "./components";
import "./confirm-modal.scss";
import { useConfirmRequestModal } from "./useConfirmRequestModal";

export const ConfirmRequestModal = (): JSX.Element | null => {
  const { pendingRequests, loading, error, accept, reject } = useConfirmRequestModal();
  const [pendingRequest] = pendingRequests;

  if (!pendingRequest) {
    return null;
  }

  switch (pendingRequest.type) {
    case PendingRequestType.INJECT:
    case PendingRequestType.APPROVE:
      return (
        <ConnectionApprovalModal
          accept={accept}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest as PendingRequest<{ origin: string }>}
          reject={reject}
        />
      );
    case PendingRequestType.SEMAPHORE_PROOF:
    case PendingRequestType.RLN_PROOF:
      return (
        <ProofModal
          accept={accept}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest as PendingRequest<ProofPayload>}
          reject={reject}
        />
      );
    default:
      return (
        <DefaultApprovalModal
          accept={accept}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest}
          reject={reject}
        />
      );
  }
};
