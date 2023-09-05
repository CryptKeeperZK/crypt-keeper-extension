/**
 * @jest-environment jsdom
 */

import { IIdentityData } from "@cryptkeeperzk/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { Paths } from "@src/constants";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  deleteIdentity,
  fetchIdentities,
  setIdentityName,
  useConnectedIdentity,
  useIdentity,
} from "@src/ui/ducks/identities";
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
  useConnectedIdentity: jest.fn(),
  useIdentity: jest.fn(),
}));

describe("ui/pages/Identity/useIdentityPage", () => {
  const defaultIdentity: IIdentityData = {
    commitment: "commitment",
    metadata: {
      account: ZERO_ADDRESS,
      name: "Account #1",
      identityStrategy: "interep",
      groups: [],
      web2Provider: "twitter",
      host: "http://localhost:3000",
    },
  };

  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useConnectedIdentity as jest.Mock).mockReturnValue(defaultIdentity);

    (useIdentity as jest.Mock).mockReturnValue(defaultIdentity);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useUrlParam as jest.Mock).mockReturnValue(defaultIdentity.commitment);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForData = async (data: IUseIdentityPageData): Promise<void> => {
    await waitFor(() => !data.isLoading);
    await waitFor(() => {
      expect(fetchIdentities).toBeCalledTimes(1);
    });
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isConnectedIdentity).toBe(true);
    expect(result.current.isConfirmModalOpen).toBe(false);
    expect(result.current.errors).toStrictEqual({ root: undefined, name: undefined });
    expect(result.current.commitment).toBe(defaultIdentity.commitment);
    expect(result.current.metadata).toStrictEqual(defaultIdentity.metadata);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should handle error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    (useIdentity as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isConnectedIdentity).toBe(false);
    expect(result.current.commitment).toBeUndefined();
    expect(result.current.metadata).toBeUndefined();
    expect(result.current.errors.root).toBe(error.message);
  });

  test("should delete identity properly", async () => {
    const { result } = renderHook(() => useIdentityPage());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onDeleteIdentity()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(deleteIdentity).toBeCalledTimes(1);
    expect(deleteIdentity).toBeCalledWith(result.current.commitment);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
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
    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(setIdentityName).toBeCalledTimes(1);
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

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(defaultIdentity.metadata.host);
  });
});
