/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { mockDefaultIdentity } from "@src/config/mock/zk";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, revealConnectedIdentityCommitment, useConnectedIdentity } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { redirectToNewTab } from "@src/util/browser";

import { IUseRevealIdentityCommitmentData, useRevealIdentityCommitment } from "../useRevealIdentityCommitment";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  redirectToNewTab: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  fetchIdentities: jest.fn(),
  revealConnectedIdentityCommitment: jest.fn(),
  useConnectedIdentity: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  rejectUserRequest: jest.fn(),
}));

describe("ui/pages/RevealIdentityCommitment/useRevealIdentityCommitment", () => {
  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (useConnectedIdentity as jest.Mock).mockReturnValue(mockDefaultIdentity);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForData = async (data: IUseRevealIdentityCommitmentData): Promise<void> => {
    await waitFor(() => !data.isLoading);
    await waitFor(() => expect(fetchIdentities).toBeCalledTimes(1));
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.connectedIdentity).toStrictEqual(mockDefaultIdentity);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
    expect(mockDispatch).toBeCalledTimes(3);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(rejectUserRequest).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
  });

  test("should handle error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(error.message);
  });

  test("should go to urlOrigin properly", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoToHost()));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(mockDefaultIdentity.metadata.host);
  });

  test("should reveal connected identity commitment properly", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onReveal()));

    expect(mockDispatch).toBeCalledTimes(3);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(revealConnectedIdentityCommitment).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
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
