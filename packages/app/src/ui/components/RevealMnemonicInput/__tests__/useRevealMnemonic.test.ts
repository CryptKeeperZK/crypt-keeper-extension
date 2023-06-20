/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { IUseTimeoutData, useTimeout } from "@src/ui/hooks/timeout";
import { copyToClipboard, downloadFile } from "@src/util/browser";

import { IUseRevealMnemonicArgs, useRevealMnemonic } from "../useRevealMnemonic";

jest.mock("@src/ui/hooks/timeout", (): unknown => ({
  useTimeout: jest.fn(),
}));

jest.mock("@src/util/browser", (): unknown => ({
  copyToClipboard: jest.fn(),
  downloadFile: jest.fn(),
}));

describe("ui/components/RevealMnemonicInput/useRevealMnemonic", () => {
  const defaultTimeoutHookData: IUseTimeoutData = {
    isActive: false,
    setActive: jest.fn(),
  };

  const defaultHookArgs: IUseRevealMnemonicArgs = {
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
    const { result } = renderHook(() => useRevealMnemonic(defaultHookArgs));

    expect(result.current.isCopied).toBe(false);
    expect(result.current.isDownloaded).toBe(false);
    expect(result.current.isShowMnemonic).toBe(false);
  });

  test("should copy mnemonic properly", async () => {
    const { result } = renderHook(() => useRevealMnemonic(defaultHookArgs));

    await act(() => Promise.resolve(result.current.onCopy()));

    expect(defaultTimeoutHookData.setActive).toBeCalledTimes(1);
    expect(copyToClipboard).toBeCalledTimes(1);
  });

  test("should download mnemonic properly", async () => {
    const { result } = renderHook(() => useRevealMnemonic(defaultHookArgs));

    await act(() => Promise.resolve(result.current.onDownload()));

    expect(defaultTimeoutHookData.setActive).toBeCalledTimes(1);
    expect(downloadFile).toBeCalledTimes(1);
  });

  test("should toggle mnemonic show properly", async () => {
    const { result } = renderHook(() => useRevealMnemonic(defaultHookArgs));

    await act(() => Promise.resolve(result.current.onShowMnemonic()));
    expect(result.current.isShowMnemonic).toBe(true);

    await act(() => Promise.resolve(result.current.onShowMnemonic()));
    expect(result.current.isShowMnemonic).toBe(false);
  });
});
