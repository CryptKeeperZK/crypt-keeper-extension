/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { IUseTimeoutData, useTimeout } from "@src/ui/hooks/timeout";
import { copyToClipboard, downloadFile } from "@src/util/browser";

import { IUseMnemonicInputArgs, useMnemonicInput } from "../useMnemonicInput";

jest.mock("@src/ui/hooks/timeout", (): unknown => ({
  useTimeout: jest.fn(),
}));

describe("ui/components/MnemonicInput/useMnemonicInput", () => {
  const defaultTimeoutHookData: IUseTimeoutData = {
    isActive: false,
    setActive: jest.fn(),
  };

  const defaultHookArgs: IUseMnemonicInputArgs = {
    mnemonic: "mnemonic",
  };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    (useTimeout as jest.Mock).mockReturnValue(defaultTimeoutHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useMnemonicInput(defaultHookArgs));

    expect(result.current.isCopied).toBe(false);
    expect(result.current.isDownloaded).toBe(false);
    expect(result.current.isShowMnemonic).toBe(false);
  });

  test("should copy mnemonic properly", async () => {
    const { result } = renderHook(() => useMnemonicInput(defaultHookArgs));

    await act(() => Promise.resolve(result.current.onCopy()));

    expect(defaultTimeoutHookData.setActive).toBeCalledTimes(1);
    expect(copyToClipboard).toBeCalledTimes(1);
  });

  test("should download mnemonic properly", async () => {
    const { result } = renderHook(() => useMnemonicInput(defaultHookArgs));

    await act(() => Promise.resolve(result.current.onDownload()));

    expect(defaultTimeoutHookData.setActive).toBeCalledTimes(1);
    expect(downloadFile).toBeCalledTimes(1);
  });

  test("should toggle mnemonic show properly", async () => {
    const { result } = renderHook(() => useMnemonicInput(defaultHookArgs));

    await act(() => Promise.resolve(result.current.onShowMnemonic()));
    expect(result.current.isShowMnemonic).toBe(true);

    await act(() => Promise.resolve(result.current.onShowMnemonic()));
    expect(result.current.isShowMnemonic).toBe(false);
  });
});
