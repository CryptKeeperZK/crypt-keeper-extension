/**
 * @jest-environment jsdom
 */

import { calculateIdentityCommitment, calculateIdentitySecret } from "@cryptkeeperzk/zk";
import { act, renderHook, waitFor } from "@testing-library/react";
import { getLinkPreview } from "link-preview-js";
import { useNavigate } from "react-router-dom";

import {
  mockDefaultIdentity,
  mockDefaultIdentityCommitment,
  mockDefaultIdentitySecret,
  mockDefaultNullifier,
  mockDefaultTrapdoor,
} from "@src/config/mock/zk";
import { Paths } from "@src/constants";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { importIdentity } from "@src/ui/ducks/identities";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { useSearchParam } from "@src/ui/hooks/url";
import { redirectToNewTab } from "@src/util/browser";

import { useImportIdentity } from "../useImportIdentity";

jest.mock("@cryptkeeperzk/zk", (): unknown => ({
  calculateIdentityCommitment: jest.fn(),
  calculateIdentitySecret: jest.fn(),
}));

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

jest.mock("@src/ui/ducks/identities", (): unknown => ({
  importIdentity: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  rejectUserRequest: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/hooks/validation", (): unknown => ({
  ...jest.requireActual("@src/ui/hooks/validation"),
  useValidationResolver: jest.fn(),
}));

describe("ui/pages/ImportIdentity/useImportIdentity", () => {
  const defaultFaviconsData = { favicons: [`${mockDefaultIdentity.metadata.urlOrigin}/favicon.ico`] };
  const defaultUrlParams = {
    urlOrigin: mockDefaultIdentity.metadata.urlOrigin,
    trapdoor: mockDefaultTrapdoor,
    nullifier: mockDefaultNullifier,
  };

  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn(() => Promise.resolve(false));

  beforeEach(() => {
    (getLinkPreview as jest.Mock).mockResolvedValue(defaultFaviconsData);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useSearchParam as jest.Mock).mockImplementation((arg: keyof typeof defaultUrlParams) => defaultUrlParams[arg]);

    (calculateIdentitySecret as jest.Mock).mockReturnValue(mockDefaultIdentitySecret);

    (calculateIdentityCommitment as jest.Mock).mockReturnValue(mockDefaultIdentityCommitment);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useImportIdentity());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.trapdoor).toBe(mockDefaultTrapdoor);
    expect(result.current.nullifier).toBe(mockDefaultNullifier);
    expect(result.current.secret).toBe(mockDefaultIdentitySecret);
    expect(result.current.commitment).toBe(mockDefaultIdentityCommitment);
    expect(result.current.errors).toStrictEqual({
      name: undefined,
      trapdoor: undefined,
      nullifier: undefined,
      root: undefined,
    });
  });

  test("should go back properly", async () => {
    (useSearchParam as jest.Mock).mockImplementation(() => "");

    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
    expect(mockDispatch).toBeCalledTimes(2);
    expect(rejectUserRequest).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
  });

  test("should go back properly without closing popup", async () => {
    (useSearchParam as jest.Mock).mockReturnValue(Paths.CREATE_IDENTITY);

    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onGoBack()));

    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(-1);
    expect(mockDispatch).toBeCalledTimes(1);
    expect(rejectUserRequest).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(0);
  });

  test("should go to host properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(() => Promise.resolve(result.current.onGoToHost()));

    expect(redirectToNewTab).toBeCalledTimes(1);
    expect(redirectToNewTab).toBeCalledWith(mockDefaultIdentity.metadata.urlOrigin);
  });

  test("should submit properly", async () => {
    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.register("name").onChange({ target: { value: "name" } }));
    await act(() => Promise.resolve(result.current.onSubmit()));

    expect(mockDispatch).toBeCalledTimes(2);
    expect(importIdentity).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(Paths.HOME);
  });

  test("should submit and go back properly", async () => {
    (useSearchParam as jest.Mock).mockImplementation((arg: string) =>
      arg === "urlOrigin" ? mockDefaultIdentity.metadata.urlOrigin : Paths.CONNECT_IDENTITY,
    );

    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.register("name").onChange({ target: { value: "name" } }));
    await act(() => Promise.resolve(result.current.onSubmit()));

    expect(mockDispatch).toBeCalledTimes(1);
    expect(importIdentity).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledTimes(1);
    expect(mockNavigate).toBeCalledWith(
      `${Paths.CONNECT_IDENTITY}?urlOrigin=${mockDefaultIdentity.metadata.urlOrigin}&back=${Paths.CONNECT_IDENTITY}`,
    );
  });

  test("should handle submit error properly", async () => {
    const error = new Error("error");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));
    const { result } = renderHook(() => useImportIdentity());

    await act(() => result.current.register("name").onChange({ target: { value: "name" } }));
    await act(() => Promise.resolve(result.current.onSubmit()));
    await waitFor(() => result.current.errors.root);

    expect(result.current.errors.root).toBe(error.message);
  });
});
