/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { getLinkPreview } from "link-preview-js";
import { useNavigate } from "react-router-dom";

import { mockDefaultIdentity } from "@src/config/mock/zk";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";

import { useImportIdentity } from "../useImportIdentity";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("link-preview-js", (): unknown => ({
  getLinkPreview: jest.fn(),
}));

jest.mock("@src/ui/hooks/url", (): unknown => ({
  useSearchParam: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  redirectToNewTab: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  rejectUserRequest: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/ImportIdentity/useImportIdentity", () => {
  const defaultFaviconsData = { favicons: [`${mockDefaultIdentity.metadata.urlOrigin}/favicon.ico`] };

  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve(false));

  const identityObject = {
    _trapdoor: "8599172605644748803815316525430713607475871751016594621440814664229873275229",
    _nullifier: "12578821460373135693013277026392552769801800051254682675996381598033497431909",
    _secret: "18581243383539966831792047417781846056480615829070187698258804610596815513832",
    _identityCommitment: "771513069964543266361335293794342776740652616031495715975492466025590633824",
  };

  const identityArray = [
    "0x1302f58f3261ab711de0dd914aeea7a494cae4ca6682e146148f072790d0515d",
    "0x1bcf5c534aca5221e6ae7c2c3e8307a7084a3f60a6d7d5dc1b6cf30cdc8a1f65",
  ];

  beforeEach(() => {
    (getLinkPreview as jest.Mock).mockResolvedValue(defaultFaviconsData);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useSearchParam as jest.Mock).mockImplementation((arg: string) =>
      arg === "urlOrigin" ? mockDefaultIdentity.metadata.urlOrigin : JSON.stringify(identityObject),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useImportIdentity());
    await waitFor(() => result.current.faviconUrl !== "");

    expect(result.current.error).toBe("");
    expect(result.current.faviconUrl).toBe(defaultFaviconsData.favicons[0]);
    expect(result.current.serializedIdentity).toBe(
      JSON.stringify(
        {
          _trapdoor: "859917...5229",
          _nullifier: "125788...1909",
          _secret: "185812...3832",
          _identityCommitment: "771513...3824",
        },
        null,
        4,
      ),
    );
    expect(result.current.serializedIdentityTooltip).toBe(JSON.stringify(identityObject, null, 4));
  });

  test("should return serialize data from identity array properly", async () => {
    (useSearchParam as jest.Mock).mockImplementation((arg: string) =>
      arg === "urlOrigin" ? mockDefaultIdentity.metadata.urlOrigin : JSON.stringify(identityArray),
    );

    const { result } = renderHook(() => useImportIdentity());
    await waitFor(() => result.current.faviconUrl !== "");

    expect(result.current.serializedIdentity).toBe(JSON.stringify(["0x1302...515d", "0x1bcf...1f65"]));
    expect(result.current.serializedIdentityTooltip).toBe(JSON.stringify(identityArray));
  });

  test("should go back properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(rejectUserRequest).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
  });

  test("should go to host properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onGoToHost()));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(mockDefaultIdentity.metadata.urlOrigin);
  });

  test("should handle load error properly", () => {
    const error = new Error("error");
    (getLinkPreview as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useImportIdentity());

    expect(result.current.faviconUrl).toBe("");
  });

  test("should handle empty params properly", () => {
    (useSearchParam as jest.Mock).mockImplementation(() => "");

    const { result } = renderHook(() => useImportIdentity());

    expect(result.current.serializedIdentity).toBeUndefined();
    expect(result.current.serializedIdentityTooltip).toBeUndefined();
  });

  test("should submit properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => result.current.error !== "");

    expect(result.current.error).toBe("not implemented");
  });
});
