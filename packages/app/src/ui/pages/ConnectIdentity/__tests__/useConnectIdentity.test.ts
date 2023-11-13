/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { getLinkPreview } from "link-preview-js";
import { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { mockDefaultConnection } from "@src/config/mock/zk";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { connect, fetchConnections, useConnectedOrigins, useConnection } from "@src/ui/ducks/connections";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { fetchIdentities, useIdentities } from "@src/ui/ducks/identities";

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

jest.mock("@src/ui/ducks/connections", (): unknown => ({
  connect: jest.fn(),
  fetchConnections: jest.fn(),
  useConnection: jest.fn(),
  useConnectedOrigins: jest.fn(),
}));

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  fetchIdentities: jest.fn(),
  useIdentities: jest.fn(),
}));

describe("ui/pages/ConnectIdentity/useConnectIdentity", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  const defaultIdentities = [
    {
      commitment: "1234",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #1",
        groups: [],
        urlOrigin: "http://localhost:3000",
      },
    },
    {
      commitment: "4321",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #2",
        groups: [],
      },
    },
  ];

  const oldHref = window.location.href;

  Object.defineProperty(window, "location", {
    value: {
      href: oldHref,
    },
    writable: true,
  });

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useIdentities as jest.Mock).mockReturnValue(defaultIdentities);

    (useConnection as jest.Mock).mockReturnValue(mockDefaultConnection);

    (useConnectedOrigins as jest.Mock).mockReturnValue({});

    window.location.href = `${oldHref}?urlOrigin=http://localhost:3000`;
  });

  afterEach(() => {
    jest.clearAllMocks();

    window.location.href = oldHref;
  });

  const waitForData = async (current: IUseConnectIdentityData) => {
    await waitFor(() => current.faviconUrl !== "");
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledTimes(2);
      expect(fetchIdentities).toHaveBeenCalledTimes(1);
      expect(fetchConnections).toHaveBeenCalledTimes(1);
    });
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);

    expect(result.current.urlOrigin).toBe("http://localhost:3000");
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.selectedTab).toBe(EConnectIdentityTabs.LINKED);
    expect(result.current.identities).toStrictEqual(defaultIdentities);
    expect(result.current.connectedOrigins).toStrictEqual({});
  });

  test("should handle empty favicon properly", () => {
    (getLinkPreview as jest.Mock).mockRejectedValue(undefined);

    const { result } = renderHook(() => useConnectIdentity());

    expect(result.current.urlOrigin).toBe("http://localhost:3000");
    expect(result.current.faviconUrl).toBe("");
  });

  test("should reject connection properly", async () => {
    const { result } = renderHook(() => useConnectIdentity());

    await act(() => Promise.resolve(result.current.onReject()));

    expect(mockDispatch).toHaveBeenCalledTimes(3);
    expect(fetchIdentities).toHaveBeenCalledTimes(1);
    expect(fetchConnections).toHaveBeenCalledTimes(1);
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
  });

  test("should connect properly", async () => {
    const { result } = renderHook(() => useConnectIdentity());

    await act(() => Promise.resolve(result.current.onSelectIdentity("1")));
    await waitFor(() => result.current.selectedIdentityCommitment === "1");
    await act(() => Promise.resolve(result.current.onConnect()));

    expect(mockDispatch).toHaveBeenCalledTimes(4);
    expect(fetchIdentities).toHaveBeenCalledTimes(1);
    expect(fetchConnections).toHaveBeenCalledTimes(1);
    expect(connect).toHaveBeenCalledTimes(1);
    expect(connect).toHaveBeenCalledWith({ commitment: "1", urlOrigin: "http://localhost:3000" });
    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(Paths.HOME);
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

  test("should select identity properly", async () => {
    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onSelectIdentity("1")));

    await waitFor(() => result.current.selectedIdentityCommitment === "1");

    expect(result.current.selectedIdentityCommitment).toBe("1");
  });
});
