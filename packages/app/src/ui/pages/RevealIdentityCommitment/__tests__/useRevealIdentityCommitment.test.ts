/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, revealConnectedIdentityCommitment, useConnectedIdentity } from "@src/ui/ducks/identities";
import { redirectToNewTab } from "@src/util/browser";

import type { IIdentityData } from "@cryptkeeperzk/types";

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

describe("ui/pages/RevealIdentityCommitment/useRevealIdentityCommitment", () => {
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

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForData = async (data: IUseRevealIdentityCommitmentData): Promise<void> => {
    await waitFor(() => data.isLoading === false);
    await waitFor(() => expect(fetchIdentities).toBeCalledTimes(1));
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.connectedIdentity).toStrictEqual(defaultIdentity);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchIdentities).toBeCalledTimes(1);
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

  test("should go to host properly", async () => {
    const { result } = renderHook(() => useRevealIdentityCommitment());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoToHost()));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(defaultIdentity.metadata.host);
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
