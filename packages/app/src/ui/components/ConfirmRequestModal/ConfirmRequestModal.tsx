import { IRlnProofRequest, PendingRequest, PendingRequestType, ZKProofPayload } from "@cryptkeeperzk/types";

import { SemaphoreProofModal, ConnectionApprovalModal, DefaultApprovalModal } from "./components";
import { RlnProofModal } from "./components/RlnProofModal";
import "./confirmModal.scss";
import { useConfirmRequestModal } from "./useConfirmRequestModal";

const ConfirmRequestModal = (): JSX.Element | null => {
  const { pendingRequests, loading, error, accept, reject } = useConfirmRequestModal();
  const [pendingRequest] = pendingRequests;

  switch (pendingRequest?.type) {
    case PendingRequestType.CONNECT:
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
      return (
        <SemaphoreProofModal
          accept={accept}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest as PendingRequest<ZKProofPayload>}
          reject={reject}
        />
      );
    case PendingRequestType.RLN_PROOF:
      return (
        <RlnProofModal
          accept={accept}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest as PendingRequest<Omit<IRlnProofRequest, "identitySerialized">>}
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

export default ConfirmRequestModal;
