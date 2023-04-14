import { useCallback, useEffect, useState } from "react";

import { HistorySettings, Operation } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  clearHistory,
  deleteHistoryOperation,
  enableHistory,
  fetchHistory,
  useHistorySettings,
  useIdentityOperations,
} from "@src/ui/ducks/identities";

export interface IUseActivityListData {
  isLoading: boolean;
  isConfirmModalOpen: boolean;
  operations: Operation[];
  settings?: HistorySettings;
  onConfirmModalShow: () => void;
  onDeleteHistoryOperation: (id: string) => void;
  onDeleteAllHistory: () => void;
  onEnableHistory: () => void;
}

export const useActivityList = (): IUseActivityListData => {
  const dispatch = useAppDispatch();
  const operations = useIdentityOperations();
  const settings = useHistorySettings();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onConfirmModalShow = useCallback(() => {
    setConfirmModalOpen((value) => !value);
  }, [setConfirmModalOpen]);

  const onDeleteHistoryOperation = useCallback(
    (id: string) => {
      dispatch(deleteHistoryOperation(id));
    },
    [dispatch],
  );

  const onEnableHistory = useCallback(() => {
    dispatch(enableHistory(!settings?.isEnabled));
  }, [dispatch, settings?.isEnabled]);

  const onDeleteAllHistory = useCallback(() => {
    dispatch(clearHistory()).then(() => onConfirmModalShow());
  }, [dispatch, onConfirmModalShow]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchHistory()).finally(() => setIsLoading(false));
  }, [dispatch, setIsLoading]);

  return {
    isLoading,
    isConfirmModalOpen,
    operations,
    settings,
    onConfirmModalShow,
    onDeleteHistoryOperation,
    onDeleteAllHistory,
    onEnableHistory,
  };
};
