import { useCallback, useState } from "react";

import { RPCAction } from "@src/constants";
import { PendingRequest, PendingRequestType, ProofPayload, RequestResolutionAction } from "@src/types";
import { useRequestsPending } from "@src/ui/ducks/requests";
import postMessage from "@src/util/postMessage";

import { ProofModal, ConnectionApprovalModal, DefaultApprovalModal } from "./components";
import "./confirm-modal.scss";

export const ConfirmRequestModal = (): JSX.Element | null => {
  const pendingRequests = useRequestsPending();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRequest] = pendingRequests;

  const reject = useCallback(
    (err?: Error) => {
      const req: RequestResolutionAction<Error | undefined> = {
        id: pendingRequest?.id,
        status: "reject",
        data: err,
      };

      setLoading(true);
      postMessage({
        method: RPCAction.FINALIZE_REQUEST,
        payload: req,
      })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [pendingRequest, setLoading, setError],
  );

  const approve = useCallback(
    (data?: unknown) => {
      const req: RequestResolutionAction<unknown | undefined> = {
        id: pendingRequest?.id,
        status: "accept",
        data,
      };

      setLoading(true);
      postMessage({
        method: RPCAction.FINALIZE_REQUEST,
        payload: req,
      })
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [pendingRequest, setError, setLoading],
  );

  if (!pendingRequest) {
    return null;
  }

  switch (pendingRequest.type) {
    case PendingRequestType.INJECT:
    case PendingRequestType.APPROVE:
      return (
        <ConnectionApprovalModal
          accept={() => approve()}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest as PendingRequest<{ origin: string }>}
          reject={() => reject()}
        />
      );
    case PendingRequestType.SEMAPHORE_PROOF:
    case PendingRequestType.RLN_PROOF:
      return (
        <ProofModal
          accept={approve}
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
          accept={approve}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest}
          reject={reject}
        />
      );
  }
};
