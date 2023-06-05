/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { ZERO_ADDRESS } from "@src/config/const";
import { HistorySettings, Operation, OperationType } from "@src/types";
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

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/Home/components/ActivityList/useActivityList", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

  const defaultIdentityOperations: Operation[] = [
    {
      id: "1",
      type: OperationType.CREATE_IDENTITY,
      identity: {
        commitment: "1",
        metadata: {
          account: ZERO_ADDRESS,
          name: "Account #1",
          identityStrategy: "interrep",
          web2Provider: "twitter",
          groups: [],
        },
      },
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      type: OperationType.DELETE_IDENTITY,
      identity: {
        commitment: "1",
        metadata: {
          account: ZERO_ADDRESS,
          name: "Account #2",
          identityStrategy: "random",
          groups: [],
        },
      },
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultHistorySettings: HistorySettings = {
    isEnabled: true,
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useIdentityOperations as jest.Mock).mockReturnValue(defaultIdentityOperations);

    (useHistorySettings as jest.Mock).mockReturnValue(defaultHistorySettings);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useActivityList());

    await waitFor(() => result.current.isLoading === false);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.operations).toStrictEqual(defaultIdentityOperations);
  });

  test("should delete history operation properly", async () => {
    const { result } = renderHook(() => useActivityList());

    await waitFor(() => result.current.isLoading === false);

    await act(async () => Promise.resolve(result.current.onDeleteHistoryOperation("1")));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchHistory).toBeCalledTimes(1);
    expect(deleteHistoryOperation).toBeCalledTimes(1);
    expect(deleteHistoryOperation).toBeCalledWith("1");
  });
});
