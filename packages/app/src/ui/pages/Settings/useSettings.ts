import { useCallback, useEffect, useState, SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { HistorySettings } from "@src/types";
import { deleteStorage, lock } from "@src/ui/ducks/app";
import { createUploadBackupRequest } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  clearHistory,
  deleteAllIdentities,
  enableHistory,
  fetchHistory,
  useHistorySettings,
} from "@src/ui/ducks/identities";
import { isExtensionPopupOpen } from "@src/util/browser";

export interface IUseSettingsData {
  isLoading: boolean;
  isConfirmModalOpen: boolean;
  isConfirmStorageDelete: boolean;
  tab: SettingsTabs;
  settings?: HistorySettings;
  onConfirmModalShow: () => void;
  onConfirmStorageDelete: () => void;
  onDeleteAllHistory: () => void;
  onEnableHistory: () => void;
  onTabChange: (event: SyntheticEvent, value: number) => void;
  onGoBack: () => void;
  onGoToBackup: () => void;
  onGoToUploadBackup: () => void;
  onGoToResetPassword: () => void;
  onGoRevealMnemonic: () => void;
  onDeleteAllIdentities: () => void;
  onDeleteStorage: () => void;
}

export enum SettingsTabs {
  GENERAL,
  SECURITY,
  BACKUP,
}

export const useSettings = (): IUseSettingsData => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const settings = useHistorySettings();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isConfirmStorageDelete, setConfirmStorageDelete] = useState(false);
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

  const onConfirmStorageDelete = useCallback(() => {
    setConfirmStorageDelete((value) => !value);
  }, [setConfirmStorageDelete]);

  const onEnableHistory = useCallback(() => {
    dispatch(enableHistory(!settings?.isEnabled));
  }, [dispatch, settings?.isEnabled]);

  const onDeleteAllHistory = useCallback(() => {
    dispatch(clearHistory()).then(() => onConfirmModalShow());
  }, [dispatch, onConfirmModalShow]);

  const onGoBack = useCallback(() => {
    navigate(Paths.HOME);
  }, [navigate]);

  const onGoToBackup = useCallback(() => {
    navigate(Paths.DOWNLOAD_BACKUP);
  }, [navigate]);

  const onGoToUploadBackup = useCallback(() => {
    if (isExtensionPopupOpen()) {
      dispatch(createUploadBackupRequest());
    } else {
      navigate(Paths.UPLOAD_BACKUP);
    }
  }, [dispatch, navigate]);

  const onGoToResetPassword = useCallback(() => {
    navigate(Paths.RECOVER);
  }, [navigate]);

  const onDeleteAllIdentities = useCallback(() => {
    dispatch(deleteAllIdentities()).then(() => onConfirmModalShow());
  }, [dispatch, onConfirmModalShow]);

  const onDeleteStorage = useCallback(() => {
    dispatch(deleteStorage())
      .then(() => onConfirmModalShow())
      .then(() => dispatch(lock()));
  }, [dispatch]);

  const onGoRevealMnemonic = useCallback(() => {
    navigate(Paths.REVEAL_MNEMONIC);
  }, [navigate]);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchHistory()).finally(() => setIsLoading(false));
  }, [dispatch, setIsLoading]);

  return {
    isLoading,
    isConfirmModalOpen,
    isConfirmStorageDelete,
    settings,
    tab,
    onConfirmModalShow,
    onConfirmStorageDelete,
    onDeleteAllHistory,
    onEnableHistory,
    onTabChange,
    onGoBack,
    onGoToBackup,
    onGoToUploadBackup,
    onGoToResetPassword,
    onGoRevealMnemonic,
    onDeleteAllIdentities,
    onDeleteStorage,
  };
};
