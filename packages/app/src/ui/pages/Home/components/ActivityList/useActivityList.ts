import { useCallback, useEffect, useState } from "react";

import { Operation } from "@src/types";
import { useConnectedOrigins } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteHistoryOperation, fetchHistory, useIdentityOperations } from "@src/ui/ducks/identities";

export interface IUseActivityListData {
  isLoading: boolean;
  operations: Operation[];
  connectedOrigins: Record<string, string>;
  onDeleteHistoryOperation: (id: string) => void;
}

export const useActivityList = (): IUseActivityListData => {
  const dispatch = useAppDispatch();
  const operations = useIdentityOperations();
  const connectedOrigins = useConnectedOrigins();
  const [isLoading, setIsLoading] = useState(false);

  const onDeleteHistoryOperation = useCallback(
    (id: string) => {
      dispatch(deleteHistoryOperation(id));
    },
    [dispatch],
  );

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchHistory()).finally(() => {
      setIsLoading(false);
    });
  }, [dispatch, setIsLoading]);

  return {
    isLoading,
    operations,
    connectedOrigins,
    onDeleteHistoryOperation,
  };
};
