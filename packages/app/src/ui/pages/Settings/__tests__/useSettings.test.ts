/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { Paths } from "@src/constants";
import { HistorySettings } from "@src/types";
import { createUploadBackupRequest } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  clearHistory,
  deleteAllIdentities,
  enableHistory,
  fetchHistory,
  useHistorySettings,
} from "@src/ui/ducks/identities";

import type { SyntheticEvent } from "react";

import { useSettings, SettingsTabs } from "../useSettings";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  getMnemonic: jest.fn(),
}));

jest.mock("@src/ui/ducks/backup", (): unknown => ({
  createUploadBackupRequest: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  clearHistory: jest.fn(),
  fetchHistory: jest.fn(),
  enableHistory: jest.fn(),
  deleteAllIdentities: jest.fn(),
  useHistorySettings: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/Settings/useSettings", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  const defaultHistorySettings: HistorySettings = {
    isEnabled: true,
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useHistorySettings as jest.Mock).mockReturnValue(defaultHistorySettings);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return intitial data", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    expect(result.current.isConfirmModalOpen).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.tab).toBe(SettingsTabs.GENERAL);
    expect(result.current.settings).toStrictEqual(defaultHistorySettings);
  });

  test("should show confirm modal", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onConfirmModalShow()));
    await waitFor(() => result.current.isConfirmModalOpen === true);

    await act(async () => Promise.resolve(result.current.onDeleteAllHistory()));

    await waitFor(() => result.current.isConfirmModalOpen === false);

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchHistory).toBeCalledTimes(1);
    expect(clearHistory).toBeCalledTimes(1);
  });

  test("should delete all history properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onDeleteAllHistory()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchHistory).toBeCalledTimes(1);
    expect(clearHistory).toBeCalledTimes(1);
  });

  test("should delete history operation properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onEnableHistory()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchHistory).toBeCalledTimes(1);
    expect(enableHistory).toBeCalledTimes(1);
    expect(enableHistory).toBeCalledWith(!defaultHistorySettings.isEnabled);
  });

  test("should change tab properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onTabChange({} as SyntheticEvent, SettingsTabs.BACKUP)));

    expect(result.current.tab).toBe(SettingsTabs.BACKUP);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
  });

  test("should go to download backup page properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onGoToBackup()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.DOWNLOAD_BACKUP);
  });

  test("should go to upload backup page properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onGoToUploadBackup()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchHistory).toBeCalledTimes(1);
    expect(createUploadBackupRequest).toBeCalledTimes(1);
  });

  test("should go to reset password page properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onGoToResetPassword()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.RECOVER);
  });

  test("should delete all identities properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onDeleteAllIdentities()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchHistory).toBeCalledTimes(1);
    expect(deleteAllIdentities).toBeCalledTimes(1);
  });

  test("should go to reveal mnemonic page properly", async () => {
    const { result } = renderHook(() => useSettings());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onGoRevealMnemonic()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.REVEAL_MNEMONIC);
  });
});
