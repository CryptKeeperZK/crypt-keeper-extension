import { IRLNProofRequest, IPendingRequest, PendingRequestType, IZKProofPayload } from "@cryptkeeperzk/types";

import { SemaphoreProofModal, ConnectionApprovalModal, DefaultApprovalModal, RlnProofModal } from "./components";
import "./confirmModal.scss";
import { useConfirmRequestModal } from "./useConfirmRequestModal";

/** @deprecated */
const ConfirmRequestModal = (): JSX.Element | null => {
  const { pendingRequests, loading, error, accept, reject } = useConfirmRequestModal();

  switch (pendingRequests[0]?.type) {
    case PendingRequestType.CONNECT:
    case PendingRequestType.APPROVE:
      return (
        <ConnectionApprovalModal
          accept={accept}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequests[0] as IPendingRequest<{ urlOrigin: string }>}
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
          pendingRequest={pendingRequests[0] as IPendingRequest<IZKProofPayload>}
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
          pendingRequest={pendingRequests[0] as IPendingRequest<Omit<IRLNProofRequest, "identitySerialized">>}
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
          pendingRequest={pendingRequests[0]}
          reject={reject}
        />
      );
  }
};

export default ConfirmRequestModal;
