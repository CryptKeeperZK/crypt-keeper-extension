import { PendingRequest, PendingRequestType, ZKProofPayload } from "@src/types";

import { ProofModal, ConnectionApprovalModal, DefaultApprovalModal } from "./components";
import "./confirmModal.scss";
import { useConfirmRequestModal } from "./useConfirmRequestModal";
import CreateIdentityModal from "./components/CreateIdentityModal/CreateIdentityModal";

const ConfirmRequestModal = (): JSX.Element | null => {
  const { pendingRequests, loading, error, accept, reject } = useConfirmRequestModal();
  const [pendingRequest] = pendingRequests;

  switch (pendingRequest?.type) {
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
          pendingRequest={pendingRequest as PendingRequest<ZKProofPayload>}
          reject={reject}
        />
      );
    case PendingRequestType.CREATE_IDENTITY:
      return (
        <CreateIdentityModal pendingRequest={pendingRequest as PendingRequest<{ host: string }>} />
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
