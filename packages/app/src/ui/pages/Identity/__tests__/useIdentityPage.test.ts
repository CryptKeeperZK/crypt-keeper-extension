/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { mockDefaultConnection, mockDefaultIdentity } from "@src/config/mock/zk";
import { Paths } from "@src/constants";
import { fetchConnections, useConnectedOrigins, useConnection } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteIdentity, fetchIdentities, setIdentityName, useIdentity } from "@src/ui/ducks/identities";
import { useUrlParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";

import { IUseIdentityPageData, useIdentityPage } from "../useIdentityPage";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/url", (): unknown => ({
  useUrlParam: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  deleteIdentity: jest.fn(),
  fetchIdentities: jest.fn(),
  setIdentityName: jest.fn(),
  useIdentity: jest.fn(),
}));

jest.mock("@src/ui/ducks/connections", (): unknown => ({
  fetchConnections: jest.fn(),
  useConnection: jest.fn(),
  useConnectedOrigins: jest.fn(),
}));

describe("ui/pages/Identity/useIdentityPage", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  const defaultConnectedOrigins = {
    [mockDefaultConnection.commitment]: mockDefaultConnection.urlOrigin,
  };

  beforeEach(() => {
    (useConnection as jest.Mock).mockReturnValue(mockDefaultConnection);

    (useIdentity as jest.Mock).mockReturnValue(mockDefaultIdentity);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useUrlParam as jest.Mock).mockReturnValue(mockDefaultIdentity.commitment);

    (useConnectedOrigins as jest.Mock).mockReturnValue(defaultConnectedOrigins);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForData = async (data: IUseIdentityPageData): Promise<void> => {
    await waitFor(() => !data.isLoading);
    await waitFor(() => {
      expect(fetchIdentities).toHaveBeenCalledTimes(1);
    });
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isConfirmModalOpen).toBe(false);
    expect(result.current.errors).toStrictEqual({ root: undefined, name: undefined });
    expect(result.current.commitment).toBe(mockDefaultIdentity.commitment);
    expect(result.current.metadata).toStrictEqual(mockDefaultIdentity.metadata);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should handle error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    (useIdentity as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.commitment).toBeUndefined();
    expect(result.current.metadata).toBeUndefined();
    expect(result.current.errors.root).toBe(error.message);
  });

  test("should delete identity properly", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onDeleteIdentity()));

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(fetchIdentities).toHaveBeenCalledTimes(1);
    expect(fetchConnections).toHaveBeenCalledTimes(1);
    expect(deleteIdentity).toHaveBeenCalledTimes(1);
    expect(deleteIdentity).toHaveBeenCalledWith(result.current.commitment);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should handle delete identity error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock)
      .mockReturnValueOnce(mockDispatch)
      .mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useIdentityPage());

    await act(() => Promise.resolve(result.current.onDeleteIdentity()));

    expect(result.current.errors.root).toBe(error.message);
  });

  test("should toggle confirm modal properly", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onConfirmDeleteIdentity()));
    expect(result.current.isConfirmModalOpen).toBe(true);

    await act(() => Promise.resolve(result.current.onConfirmDeleteIdentity()));
    expect(result.current.isConfirmModalOpen).toBe(false);
  });

  test("should confirm update properly", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.register("name").onChange({ target: { value: "Account" } })));
    await act(() => Promise.resolve(result.current.onConfirmUpdate()));

    expect(result.current.isUpdating).toBe(false);
    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(fetchIdentities).toHaveBeenCalledTimes(1);
    expect(fetchConnections).toHaveBeenCalledTimes(1);
    expect(setIdentityName).toHaveBeenCalledTimes(1);
  });

  test("should handle confirm update error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock)
      .mockReturnValueOnce(mockDispatch)
      .mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useIdentityPage());

    await act(() => Promise.resolve(result.current.register("name").onChange({ target: { value: "Account" } })));
    await act(() => Promise.resolve(result.current.onConfirmUpdate()));

    expect(result.current.errors.root).toBe(error.message);
  });

  test("should toggle update identity properly", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onUpdateIdentity()));
    expect(result.current.isUpdating).toBe(true);

    await act(() => Promise.resolve(result.current.onUpdateIdentity()));
    expect(result.current.isUpdating).toBe(false);
  });

  test("should go to host properly", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoToHost()));

    expect(redirectToNewTab).toHaveBeenCalledTimes(1);
    expect(redirectToNewTab).toHaveBeenCalledWith(mockDefaultConnection.urlOrigin);
  });
});
