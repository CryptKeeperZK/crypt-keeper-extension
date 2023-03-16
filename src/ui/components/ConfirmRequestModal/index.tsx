import { useCallback, useState } from "react";

import { RPCAction } from "@src/constants";
import { PendingRequestType, RequestResolutionAction } from "@src/types";
import { useRequestsPending } from "@src/ui/ducks/requests";
import postMessage from "@src/util/postMessage";

import ConnectionApprovalModal from "./components/ConnectionApprovalModal";
import { ConnectionWalletModal } from "./components/ConnectionWalletModal";
import CreateIdentityApprovalModal from "./components/CreateIdentityApprovalModal";
import DefaultApprovalModal from "./components/DefaultApprovalModal";
import ProofModal from "./components/ProofModal";

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
      return (
        <ConnectionApprovalModal
          accept={() => approve()}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest}
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
          pendingRequest={pendingRequest}
          reject={reject}
        />
      );
    case PendingRequestType.CREATE_IDENTITY:
      return (
        <CreateIdentityApprovalModal
          accept={approve}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          reject={reject}
        />
      );
    case PendingRequestType.CONNECT_WALLET:
      return (
        <ConnectionWalletModal
          accept={() => approve()}
          error={error}
          len={pendingRequests.length}
          loading={loading}
          pendingRequest={pendingRequest}
          reject={() => reject()}
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
