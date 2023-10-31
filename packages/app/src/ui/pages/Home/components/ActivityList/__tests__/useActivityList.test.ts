/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { mockDefaultConnection, mockDefaultIdentity } from "@src/config/mock/zk";
import { HistorySettings, Operation, OperationType } from "@src/types";
import { useConnectedOrigins } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  deleteHistoryOperation,
  fetchHistory,
  useHistorySettings,
  useIdentityOperations,
} from "@src/ui/ducks/identities";

import { useActivityList } from "../useActivityList";

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  deleteHistoryOperation: jest.fn(),
  fetchHistory: jest.fn(),
  useHistorySettings: jest.fn(),
  useIdentityOperations: jest.fn(),
}));

jest.mock("@src/ui/ducks/connections", (): unknown => ({
  useConnectedOrigins: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/Home/components/ActivityList/useActivityList", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const defaultIdentityOperations: Operation[] = [
    {
      id: "1",
      type: OperationType.CREATE_IDENTITY,
      identity: mockDefaultIdentity,
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: OperationType.DELETE_IDENTITY,
      identity: mockDefaultIdentity,
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultConnectedOrigins = {
    [mockDefaultIdentity.commitment]: mockDefaultConnection.urlOrigin,
  };

  const defaultHistorySettings: HistorySettings = {
    isEnabled: true,
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useIdentityOperations as jest.Mock).mockReturnValue(defaultIdentityOperations);

    (useConnectedOrigins as jest.Mock).mockReturnValue(defaultConnectedOrigins);

    (useHistorySettings as jest.Mock).mockReturnValue(defaultHistorySettings);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useActivityList());

    await waitFor(() => !result.current.isLoading);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.operations).toStrictEqual(defaultIdentityOperations);
  });

  test("should delete history operation properly", async () => {
    const { result } = renderHook(() => useActivityList());

    await waitFor(() => !result.current.isLoading);

    await act(async () => Promise.resolve(result.current.onDeleteHistoryOperation("1")));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchHistory).toBeCalledTimes(1);
    expect(deleteHistoryOperation).toBeCalledTimes(1);
    expect(deleteHistoryOperation).toBeCalledWith("1");
  });
});
