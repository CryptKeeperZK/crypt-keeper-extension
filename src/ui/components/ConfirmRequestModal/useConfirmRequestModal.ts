import { useCallback, useState } from "react";

import { RPCAction } from "@src/constants";
import { PendingRequest, RequestResolutionAction, RequestResolutionStatus } from "@src/types";
import { usePendingRequests } from "@src/ui/ducks/requests";
import postMessage from "@src/util/postMessage";

export interface IUseConfirmRequestModalData {
  error: string;
  loading: boolean;
  pendingRequests: PendingRequest[];
  accept: (data?: unknown) => void;
  reject: (err?: Error) => void;
}

export const useConfirmRequestModal = (): IUseConfirmRequestModalData => {
  const pendingRequests = usePendingRequests();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingRequest] = pendingRequests;

  const reject = useCallback(
    (err?: Error) => {
      const req: RequestResolutionAction<Error> = {
        id: pendingRequest?.id,
        status: RequestResolutionStatus.REJECT,
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
    [pendingRequest?.id, setLoading, setError],
  );

  const accept = useCallback(
    (data?: unknown) => {
      const req: RequestResolutionAction = {
        id: pendingRequest?.id,
        status: RequestResolutionStatus.ACCEPT,
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
    [pendingRequest?.id, setError, setLoading],
  );

  return {
    loading,
    error,
    pendingRequests,
    accept,
    reject,
  };
};
