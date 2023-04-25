import { useCallback, useEffect, useState, SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import { HistorySettings } from "@src/types";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  clearHistory,
  deleteAllIdentities,
  enableHistory,
  fetchHistory,
  useHistorySettings,
} from "@src/ui/ducks/identities";

export interface IUseSettingsData {
  isLoading: boolean;
  isConfirmModalOpen: boolean;
  tab: SettingsTabs;
  settings?: HistorySettings;
  onConfirmModalShow: () => void;
  onDeleteAllHistory: () => void;
  onEnableHistory: () => void;
  onTabChange: (event: SyntheticEvent, value: number) => void;
  onGoBack: () => void;
  onDeleteAllIdentities: () => void;
}

export enum SettingsTabs {
  GENERAL = 0,
  BACKUP = 1,
  ADVANCED = 2,
}

export const useSettings = (): IUseSettingsData => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const settings = useHistorySettings();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState(SettingsTabs.GENERAL);

  const onTabChange = useCallback(
    (_: React.SyntheticEvent, newValue: number) => {
      setTab(newValue);
    },
    [setTab],
  );

  const onConfirmModalShow = useCallback(() => {
    setConfirmModalOpen((value) => !value);
  }, [setConfirmModalOpen]);

  const onEnableHistory = useCallback(() => {
    dispatch(enableHistory(!settings?.isEnabled));
  }, [dispatch, settings?.isEnabled]);

  const onDeleteAllHistory = useCallback(() => {
    dispatch(clearHistory()).then(() => onConfirmModalShow());
  }, [dispatch, onConfirmModalShow]);

  const onGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const onDeleteAllIdentities = useCallback(() => {
    dispatch(deleteAllIdentities()).then(() => onConfirmModalShow());
  }, [dispatch, onConfirmModalShow]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchHistory()).finally(() => setIsLoading(false));
  }, [dispatch, setIsLoading]);

  return {
    isLoading,
    isConfirmModalOpen,
    settings,
    tab,
    onConfirmModalShow,
    onDeleteAllHistory,
    onEnableHistory,
    onTabChange,
    onGoBack,
    onDeleteAllIdentities,
  };
};
