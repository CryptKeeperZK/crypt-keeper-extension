import { useCallback, useState } from "react";
import { useRequestsPending } from "@src/ui/ducks/requests";
import { PendingRequestType, RequestResolutionAction } from "@src/types";
import RPCAction from "@src/util/constants";
import postMessage from "@src/util/postMessage";
import "./confirm-modal.scss";
import { ConnectionApprovalModal } from "./components/ConnectionApprovalModal";
import { DummyApprovalModal } from "./components/DummyApprovalModal";
import { CreateIdentityApprovalModal } from "./components/CreateIdentityApprovalModal";
import { DefaultApprovalModal } from "./components/DefaultApprovalModal";
import { ProofModal } from "./components/ProofModal";

export default function ConfirmRequestModal(): JSX.Element {
  const pendingRequests = useRequestsPending();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRequest] = pendingRequests;

  const reject = useCallback(
    async (err?: any) => {
      setLoading(true);
      try {
        const id = pendingRequest?.id;
        const req: RequestResolutionAction<undefined> = {
          id,
          status: "reject",
          data: err,
        };
        postMessage({
          method: RPCAction.FINALIZE_REQUEST,
          payload: req,
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [pendingRequest],
  );

  const approve = useCallback(
    async (data?: any) => {
      setLoading(true);
      try {
        const id = pendingRequest?.id;
        const req: RequestResolutionAction<undefined> = {
          id,
          status: "accept",
          data,
        };
        postMessage({
          method: RPCAction.FINALIZE_REQUEST,
          payload: req,
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [pendingRequest],
  );

  if (!pendingRequest) return <></>;

  switch (pendingRequest.type) {
    case PendingRequestType.INJECT:
      return (
        <ConnectionApprovalModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={() => approve()}
          reject={() => reject()}
          error={error}
          loading={loading}
        />
      );
    case PendingRequestType.SEMAPHORE_PROOF:
    case PendingRequestType.RLN_PROOF:
      return (
        <ProofModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={() => approve()}
          reject={() => reject()}
          error={error}
          loading={loading}
        />
      );
    case PendingRequestType.DUMMY:
      return (
        <DummyApprovalModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={() => approve()}
          reject={() => reject()}
          error={error}
          loading={loading}
        />
      );
    case PendingRequestType.CREATE_IDENTITY:
      return (
        <CreateIdentityApprovalModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={approve}
          reject={reject}
          error={error}
          loading={loading}
        />
      );
    default:
      return (
        <DefaultApprovalModal
          len={pendingRequests.length}
          pendingRequest={pendingRequest}
          accept={approve}
          reject={reject}
          error={error}
          loading={loading}
        />
      );
  }
}
