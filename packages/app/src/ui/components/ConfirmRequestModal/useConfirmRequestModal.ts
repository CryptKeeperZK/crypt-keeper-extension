import { IPendingRequest, IRequestResolutionAction, RequestResolutionStatus } from "@cryptkeeperzk/types";
import { useCallback, useState } from "react";

import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchPendingRequests, finalizeRequest, usePendingRequests } from "@src/ui/ducks/requests";

export interface IUseConfirmRequestModalData {
  error: string;
  loading: boolean;
  pendingRequests: IPendingRequest[];
  accept: (data?: unknown) => void;
  reject: (err?: Error) => void;
}

export const useConfirmRequestModal = (): IUseConfirmRequestModalData => {
  const pendingRequests = usePendingRequests();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pendingRequest = pendingRequests[0] as IPendingRequest | undefined;

  const finalize = useCallback(
    (req: IRequestResolutionAction) => {
      setLoading(true);
      dispatch(finalizeRequest(req))
        .then(() => dispatch(fetchPendingRequests()))
        .then(() => dispatch(closePopup()))
        .catch((e: Error) => {
          setError(e.message);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [setLoading, setError, dispatch],
  );

  const reject = useCallback(
    (err?: Error) => {
      if (!pendingRequest) {
        dispatch(closePopup());
        return;
      }

      finalize({
        id: pendingRequest.id,
        status: RequestResolutionStatus.REJECT,
        data: err,
      });
    },
    [pendingRequest?.id, finalize],
  );

  const accept = useCallback(
    (data?: unknown) => {
      finalize({
        id: pendingRequest!.id,
        status: RequestResolutionStatus.ACCEPT,
        data,
      });
    },
    [pendingRequest?.id, finalize],
  );

  return {
    loading,
    error,
    pendingRequests,
    accept,
    reject,
  };
};
