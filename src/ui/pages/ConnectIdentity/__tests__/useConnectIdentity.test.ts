/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { getLinkPreview } from "link-preview-js";
import { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";

import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";

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

describe("ui/pages/ConnectIdentity/useConnectIdentity", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const waitForData = async (current: IUseConnectIdentityData) => {
    await waitFor(() => current.faviconUrl !== "");
  };

  test("should return initial data", async () => {
    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);

    expect(result.current.host).toBe("http://localhost:3000");
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.selectedTab).toBe(EConnectIdentityTabs.LINKED);
    expect(result.current.isShowTabs).toBe(true);
    expect(result.current.linkedIdentities).toHaveLength(1);
    expect(result.current.unlinkedIdentities).toHaveLength(1);
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

    expect(mockDispatch).toBeCalledTimes(1);
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

  test("should select identity properly", async () => {
    const { result } = renderHook(() => useConnectIdentity());
    await waitForData(result.current);

    await act(() => Promise.resolve(result.current.onSelectIdentity("1")));

    await waitFor(() => result.current.selectedIdentityCommitment === "1");

    expect(result.current.selectedIdentityCommitment).toBe("1");
  });
});
