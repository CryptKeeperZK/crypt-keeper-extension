/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { getLinkPreview } from "link-preview-js";
import { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, useLinkedIdentities, useUnlinkedIdentities } from "@src/ui/ducks/identities";

import { EConnectIdentityTabs, IUseConnectIdentityData, useConnectIdentity } from "../useConnectIdentity";

jest.mock("link-preview-js", (): unknown => ({
  getLinkPreview: jest.fn().mockResolvedValue({
    favicons: ["http://localhost:3000/favicon.ico"],
  }),
}));

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  fetchIdentities: jest.fn(),
  useLinkedIdentities: jest.fn(),
  useUnlinkedIdentities: jest.fn(),
}));

describe("ui/pages/ConnectIdentity/useConnectIdentity", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  const defaultLinkedIdentities = [
    {
      commitment: "1234",
      metadata: {
        identityStrategy: "random",
        account: ZERO_ADDRESS,
        name: "Account #1",
        groups: [],
        host: "http://localhost:3000",
      },
    },
  ];

  const defaultUnlinkedIdentities = [
    {
      commitment: "4321",
      metadata: {
        identityStrategy: "random",
        account: ZERO_ADDRESS,
        name: "Account #2",
        groups: [],
      },
    },
  ];

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useLinkedIdentities as jest.Mock).mockReturnValue(defaultLinkedIdentities);

    (useUnlinkedIdentities as jest.Mock).mockReturnValue(defaultUnlinkedIdentities);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForData = async (current: IUseConnectIdentityData) => {
    await waitFor(() => current.faviconUrl !== "");
    await waitFor(() => expect(mockDispatch).toBeCalledTimes(1));
    await waitFor(() => expect(fetchIdentities).toBeCalledTimes(1));
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);

    expect(result.current.host).toBe("http://localhost:3000");
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.selectedTab).toBe(EConnectIdentityTabs.LINKED);
    expect(result.current.linkedIdentities).toStrictEqual(defaultLinkedIdentities);
    expect(result.current.unlinkedIdentities).toStrictEqual(defaultUnlinkedIdentities);
  });

  test("should handle empty favicon properly", () => {
    (getLinkPreview as jest.Mock).mockRejectedValue(undefined);

    const { result } = renderHook(() => useConnectIdentity());

    expect(result.current.host).toBe("http://localhost:3000");
    expect(result.current.faviconUrl).toBe("");
  });

  test("should reject connection properly", async () => {
    const { result } = renderHook(() => useConnectIdentity());

    await act(() => Promise.resolve(result.current.onReject()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
  });

  test("should change tab properly", async () => {
    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);

    await act(() =>
      Promise.resolve(result.current.onTabChange({} as unknown as SyntheticEvent, EConnectIdentityTabs.UNLINKED)),
    );

    await waitFor(() => result.current.selectedTab === EConnectIdentityTabs.UNLINKED);

    expect(result.current.selectedTab).toBe(EConnectIdentityTabs.UNLINKED);
  });

  test("should change tab if there is no linked identities", async () => {
    (useLinkedIdentities as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);
    await waitFor(() => result.current.selectedTab === EConnectIdentityTabs.UNLINKED);

    expect(result.current.selectedTab).toBe(EConnectIdentityTabs.UNLINKED);
  });

  test("should change tab if there is no unlinked identities", async () => {
    (useUnlinkedIdentities as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);
    await waitFor(() => result.current.selectedTab === EConnectIdentityTabs.LINKED);

    expect(result.current.selectedTab).toBe(EConnectIdentityTabs.LINKED);
  });

  test("should select identity properly", async () => {
    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onSelectIdentity("1")));

    await waitFor(() => result.current.selectedIdentityCommitment === "1");

    expect(result.current.selectedIdentityCommitment).toBe("1");
  });
});
