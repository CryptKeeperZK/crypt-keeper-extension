import { useCallback, useState } from "react";

import { RPCAction } from "@src/constants";
import { PendingRequest, RequestResolutionAction } from "@src/types";
import { useRequestsPending } from "@src/ui/ducks/requests";
import postMessage from "@src/util/postMessage";

export interface IUseConfirmRequestModalData {
  error: string;
  loading: boolean;
  pendingRequests: PendingRequest[];
  accept: (data?: unknown) => void;
  reject: (err?: Error) => void;
}

export const useConfirmRequestModal = (): IUseConfirmRequestModalData => {
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
    [pendingRequest?.id, setLoading, setError],
  );

  const accept = useCallback(
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
