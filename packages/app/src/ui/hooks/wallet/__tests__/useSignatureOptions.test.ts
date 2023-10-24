/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";

import { defaultWalletHookData } from "@src/config/mock/wallet";

import { useSignatureOptions } from "..";
import { useEthWallet } from "../useEthWallet";

jest.mock("../useEthWallet", (): unknown => ({
  useEthWallet: jest.fn(),
}));

describe("ui/hooks/useSignatureOptions", () => {
  const defaultHookArgs = {
    isLoading: false,
  };

  beforeEach(() => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return cryptkeeper and eth wallet options", () => {
    const { result } = renderHook(() => useSignatureOptions(defaultHookArgs));

    expect(result.current.options[0].id).toBe("ck");
    expect(result.current.options[0].title).toBe("Sign with CryptKeeper");
    expect(result.current.options[0].checkDisabledItem()).toBe(defaultHookArgs.isLoading);
    expect(result.current.options[1].id).toBe("eth");
    expect(result.current.options[1].title).toBe("Sign with MetaMask");
    expect(result.current.options[1].checkDisabledItem()).toBe(defaultHookArgs.isLoading);
  });

  test("should return cryptkeeper and connect eth wallet options", () => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: false });

    const { result } = renderHook(() => useSignatureOptions(defaultHookArgs));

    expect(result.current.options[0].id).toBe("ck");
    expect(result.current.options[0].title).toBe("Sign with CryptKeeper");
    expect(result.current.options[0].checkDisabledItem()).toBe(defaultHookArgs.isLoading);
    expect(result.current.options[1].id).toBe("eth");
    expect(result.current.options[1].title).toBe("Connect to MetaMask");
    expect(result.current.options[1].checkDisabledItem()).toBe(defaultHookArgs.isLoading);
  });

  test("should return cryptkeeper and install eth wallet options", () => {
    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: false, isInjectedWallet: false });

    const { result } = renderHook(() => useSignatureOptions(defaultHookArgs));

    expect(result.current.options[0].id).toBe("ck");
    expect(result.current.options[0].title).toBe("Sign with CryptKeeper");
    expect(result.current.options[0].checkDisabledItem()).toBe(defaultHookArgs.isLoading);
    expect(result.current.options[1].id).toBe("eth");
    expect(result.current.options[1].title).toBe("Install MetaMask");
    expect(result.current.options[1].checkDisabledItem()).toBe(true);
  });
});
