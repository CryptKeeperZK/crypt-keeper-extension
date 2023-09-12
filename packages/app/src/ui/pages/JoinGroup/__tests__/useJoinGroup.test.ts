/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { getLinkPreview } from "link-preview-js";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { getBandadaUrl } from "@src/config/env";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { joinGroup } from "@src/ui/ducks/groups";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, useConnectedIdentity } from "@src/ui/ducks/identities";
import { useSearchParam, useUrlParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";

import type { IIdentityData } from "@cryptkeeperzk/types";

import { IUseJoinGroupData, useJoinGroup } from "../useJoinGroup";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("link-preview-js", (): unknown => ({
  getLinkPreview: jest.fn(),
}));

jest.mock("@src/ui/hooks/url", (): unknown => ({
  useSearchParam: jest.fn(),
  useUrlParam: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  redirectToNewTab: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/groups", (): unknown => ({
  joinGroup: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  fetchIdentities: jest.fn(),
  useConnectedIdentity: jest.fn(),
}));

describe("ui/pages/JoinGroup/useJoinGroup", () => {
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

  const defaultFaviconsData = { favicons: [`${defaultIdentity.metadata.host}/favicon.ico`] };

  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve());

  beforeEach(() => {
    (getLinkPreview as jest.Mock).mockResolvedValue(defaultFaviconsData);

    (useConnectedIdentity as jest.Mock).mockReturnValue(defaultIdentity);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useUrlParam as jest.Mock).mockReturnValue("groupId");

    (useSearchParam as jest.Mock).mockImplementation((arg: string) => arg);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForData = async (data: IUseJoinGroupData): Promise<void> => {
    await waitFor(() => !data.isLoading);
    await waitFor(() => expect(fetchIdentities).toBeCalledTimes(1));
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useJoinGroup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe("");
    expect(result.current.apiKey).toBe("apiKey");
    expect(result.current.inviteCode).toBe("inviteCode");
    expect(result.current.faviconUrl).toBe(defaultFaviconsData.favicons[0]);
    expect(result.current.groupId).toBe("groupId");
    expect(result.current.connectedIdentity).toStrictEqual(defaultIdentity);
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useJoinGroup());
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
    (getLinkPreview as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useJoinGroup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(error.message);
    expect(result.current.faviconUrl).toBe("");
  });

  test("should handle empty connected identity properly", async () => {
    (useConnectedIdentity as jest.Mock).mockReturnValue(undefined);

    const { result } = renderHook(() => useJoinGroup());
    await waitForData(result.current);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.connectedIdentity).toBeUndefined();
  });

  test("should go to host properly", async () => {
    const { result } = renderHook(() => useJoinGroup());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoToHost()));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(defaultIdentity.metadata.host);
  });

  test("should go to group properly", async () => {
    const { result } = renderHook(() => useJoinGroup());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onGoToGroup()));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(`${getBandadaUrl()}/groups/off-chain/groupId`);
  });

  test("should join group properly", async () => {
    const { result } = renderHook(() => useJoinGroup());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onJoin()));
    await waitFor(() => !result.current.isSubmitting);

    expect(mockDispatch).toBeCalledTimes(3);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(joinGroup).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should handle reveal connected identity commitment error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock)
      .mockReturnValueOnce(mockDispatch)
      .mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useJoinGroup());

    await act(() => Promise.resolve(result.current.onJoin()));

    expect(result.current.error).toBe(error.message);
  });
});
