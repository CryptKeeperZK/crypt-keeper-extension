/**
 * @jest-environment jsdom
 */

import { PendingRequestType } from "@cryptkeeperzk/types";
import { act, renderHook, waitFor } from "@testing-library/react";

import {
  IUseSemaphoreProofModalArgs,
  IUseSemaphoreProofModalData,
  useSemaphoreProofModal,
} from "../useSemaphoreProofModal";

describe("ui/components/ConfirmRequestModal/components/ProofModal/useSemaphoreProofModal", () => {
  const defaultArgs: IUseSemaphoreProofModalArgs = {
    pendingRequest: {
      id: "1",
      type: PendingRequestType.SEMAPHORE_PROOF,
      payload: {
        externalNullifier: "externalNullifier",
        signal: "0x1",
        circuitFilePath: "circuitFilePath",
        verificationKey: "verificationKey",
        zkeyFilePath: "zkeyFilePath",
        urlOrigin: "http://localhost:3000",
      },
    },
    accept: jest.fn(),
    reject: jest.fn(),
  };

  const jsdomOpen = window.open;

  const waitForData = async (current: IUseSemaphoreProofModalData) => {
    await waitFor(() => current.urlOrigin !== "");
    await waitFor(() => current.faviconUrl !== "");
  };

  beforeAll(() => {
    window.open = jest.fn();
  });

  afterAll(() => {
    window.open = jsdomOpen;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return empty data", () => {
    const { result } = renderHook(() =>
      useSemaphoreProofModal({
        ...defaultArgs,
        pendingRequest: {
          ...defaultArgs.pendingRequest,
          type: -1 as unknown as PendingRequestType,
          payload: undefined,
        },
      }),
    );

    expect(result.current.operation).toBe("Generate proof");
    expect(result.current.faviconUrl).toBe("");
    expect(result.current.urlOrigin).toBe("");
    expect(result.current.payload).toBeUndefined();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useSemaphoreProofModal(defaultArgs));
    await waitForData(result.current);

    expect(result.current.operation).toBe("Generate Semaphore Proof");
    expect(result.current.faviconUrl).toBe("http://localhost:3000/favicon.ico");
    expect(result.current.urlOrigin).toBe(defaultArgs.pendingRequest.payload?.urlOrigin);
    expect(result.current.payload).toStrictEqual(defaultArgs.pendingRequest.payload);
  });

  test("should accept proof generation properly", async () => {
    const { result } = renderHook(() => useSemaphoreProofModal(defaultArgs));
    await waitForData(result.current);

    act(() => {
      result.current.onAccept();
    });

    expect(defaultArgs.accept).toBeCalledTimes(1);
  });

  test("should reject proof generation properly", async () => {
    const { result } = renderHook(() => useSemaphoreProofModal(defaultArgs));
    await waitForData(result.current);

    act(() => {
      result.current.onReject();
    });

    expect(defaultArgs.reject).toBeCalledTimes(1);
  });

  test("should open circuit file properly", async () => {
    const openSpy = jest.spyOn(window, "open");
    const { result } = renderHook(() => useSemaphoreProofModal(defaultArgs));
    await waitForData(result.current);

    act(() => {
      result.current.onOpenCircuitFile();
    });

    expect(openSpy).toBeCalledTimes(1);
    expect(openSpy).toBeCalledWith(defaultArgs.pendingRequest.payload?.circuitFilePath, "_blank");
  });

  test("should open zkey file properly", async () => {
    const openSpy = jest.spyOn(window, "open");
    const { result } = renderHook(() => useSemaphoreProofModal(defaultArgs));
    await waitForData(result.current);

    act(() => {
      result.current.onOpenZkeyFile();
    });

    expect(openSpy).toBeCalledTimes(1);
    expect(openSpy).toBeCalledWith(defaultArgs.pendingRequest.payload?.zkeyFilePath, "_blank");
  });

  test("should open verification key file properly", async () => {
    const openSpy = jest.spyOn(window, "open");
    const { result } = renderHook(() => useSemaphoreProofModal(defaultArgs));
    await waitForData(result.current);

    act(() => {
      result.current.onOpenVerificationKeyFile();
    });

    expect(openSpy).toBeCalledTimes(1);
    expect(openSpy).toBeCalledWith(defaultArgs.pendingRequest.payload?.verificationKey, "_blank");
  });
});
