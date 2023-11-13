/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { mockDefaultConnection } from "@src/config/mock/zk";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { fetchConnections, revealConnectedIdentityCommitment, useConnection } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";

import { IUseRevealIdentityCommitmentData, useRevealIdentityCommitment } from "../useRevealIdentityCommitment";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  redirectToNewTab: jest.fn(),
}));

jest.mock("@src/ui/hooks/url", (): unknown => ({
  useSearchParam: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  fetchIdentities: jest.fn(),
}));

jest.mock("@src/ui/ducks/connections", (): unknown => ({
  revealConnectedIdentityCommitment: jest.fn(),
  fetchConnections: jest.fn(),
  useConnection: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  rejectUserRequest: jest.fn(),
}));

describe("ui/pages/RevealIdentityCommitment/useRevealIdentityCommitment", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useConnection as jest.Mock).mockReturnValue(mockDefaultConnection);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useSearchParam as jest.Mock).mockReturnValue(mockDefaultConnection.urlOrigin);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForData = async (data: IUseRevealIdentityCommitmentData): Promise<void> => {
    await waitFor(() => !data.isLoading);
    await waitFor(() => expect(fetchIdentities).toHaveBeenCalledTimes(1));
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.connection).toStrictEqual(mockDefaultConnection);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
    expect(mockDispatch).toHaveBeenCalledTimes(4);
    expect(fetchIdentities).toHaveBeenCalledTimes(1);
    expect(fetchConnections).toHaveBeenCalledTimes(1);
    expect(rejectUserRequest).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(1);
  });

  test("should handle error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(error.message);
  });

  test("should go to host properly", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoToHost()));

    expect(redirectToNewTab).toHaveBeenCalledTimes(1);
    expect(redirectToNewTab).toHaveBeenCalledWith(mockDefaultConnection.urlOrigin);
  });

  test("should reveal connected identity commitment properly", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onReveal()));

    expect(mockDispatch).toHaveBeenCalledTimes(4);
    expect(fetchIdentities).toHaveBeenCalledTimes(1);
    expect(fetchConnections).toHaveBeenCalledTimes(1);
    expect(revealConnectedIdentityCommitment).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should handle reveal connected identity commitment error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock)
      .mockReturnValueOnce(mockDispatch)
      .mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useRevealIdentityCommitment());

    await act(() => Promise.resolve(result.current.onReveal()));

    expect(result.current.error).toBe(error.message);
  });
});
