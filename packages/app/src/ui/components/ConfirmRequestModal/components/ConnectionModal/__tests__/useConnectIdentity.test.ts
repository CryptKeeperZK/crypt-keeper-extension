/**
 * @jest-environment jsdom
 */

import { PendingRequestType } from "@cryptkeeperzk/types";
import { act, renderHook, waitFor } from "@testing-library/react";
import { getLinkPreview } from "link-preview-js";
import { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import { ZERO_ADDRESS } from "@src/config/const";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { connectIdentity, fetchIdentities, useConnectedIdentity, useIdentities } from "@src/ui/ducks/identities";

import {
  EConnectIdentityTabs,
  IUseConnectIdentityData,
  IUseConnectionModalArgs,
  useConnectIdentity,
} from "../useConnectionModal";

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
  connectIdentity: jest.fn(),
  useConnectedIdentity: jest.fn(),
  useIdentities: jest.fn(),
}));

describe("ui/pages/ConnectIdentity/useConnectIdentity", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  const defaultIdentities = [
    {
      commitment: "1234",
      metadata: {
        identityStrategy: "random",
        account: ZERO_ADDRESS,
        name: "Account #1",
        groups: [],
        urlOrigin: "http://localhost:3000",
      },
    },
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

  const defaultArgs: IUseConnectionModalArgs = {
    pendingRequest: {
      id: "1",
      type: PendingRequestType.APPROVE,
      payload: { urlOrigin: "http://localhost:3000" },
    },
    accept: jest.fn(),
    reject: jest.fn(),
  };

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

    (useConnectedIdentity as jest.Mock).mockReturnValue(defaultIdentities[0]);

    window.location.href = `${oldHref}?urlOrigin=http://localhost:3000`;
  });

  afterEach(() => {
    jest.clearAllMocks();

    window.location.href = oldHref;
  });

  const waitForData = async (current: IUseConnectIdentityData) => {
    await waitFor(() => current.faviconUrl !== "");
    await waitFor(() => {
      expect(mockDispatch).toBeCalledTimes(1);
    });
    await waitFor(() => {
      expect(fetchIdentities).toBeCalledTimes(1);
    });
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectIdentity({ ...defaultArgs }));
    await waitForData(result.current);

    expect(result.current.urlOrigin).toBe("http://localhost:3000");
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.selectedTab).toBe(EConnectIdentityTabs.LINKED);
    expect(result.current.identities).toStrictEqual(defaultIdentities);
  });

  test("should handle empty favicon properly", () => {
    (getLinkPreview as jest.Mock).mockRejectedValue(undefined);

    const { result } = renderHook(() => useConnectIdentity({ ...defaultArgs }));

    expect(result.current.urlOrigin).toBe("http://localhost:3000");
    expect(result.current.faviconUrl).toBe("");
  });

  test("should reject connection properly", async () => {
    const { result } = renderHook(() => useConnectIdentity({ ...defaultArgs }));

    await act(() => Promise.resolve(result.current.onReject()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should connect properly", async () => {
    const { result } = renderHook(() => useConnectIdentity({ ...defaultArgs }));

    await act(() => Promise.resolve(result.current.onSelectIdentity("1")));
    await waitFor(() => result.current.selectedIdentityCommitment === "1");
    await act(() => Promise.resolve(result.current.onAccept()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(fetchIdentities).toBeCalledTimes(1);
    expect(connectIdentity).toBeCalledTimes(1);
    expect(connectIdentity).toBeCalledWith({ identityCommitment: "1", urlOrigin: "http://localhost:3000" });
  });

  test("should change tab properly", async () => {
    const { result } = renderHook(() => useConnectIdentity({ ...defaultArgs }));
    await waitForData(result.current);

    await act(() =>
      Promise.resolve(result.current.onTabChange({} as unknown as SyntheticEvent, EConnectIdentityTabs.UNLINKED)),
    );

    await waitFor(() => result.current.selectedTab === EConnectIdentityTabs.UNLINKED);

    expect(result.current.selectedTab).toBe(EConnectIdentityTabs.UNLINKED);
  });

  test("should select identity properly", async () => {
    const { result } = renderHook(() => useConnectIdentity({ ...defaultArgs }));
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onSelectIdentity("1")));

    await waitFor(() => result.current.selectedIdentityCommitment === "1");

    expect(result.current.selectedIdentityCommitment).toBe("1");
  });
});
