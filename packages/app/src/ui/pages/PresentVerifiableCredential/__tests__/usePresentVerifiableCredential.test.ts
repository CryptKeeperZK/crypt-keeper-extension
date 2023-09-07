/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  generateVerifiablePresentation,
  rejectVerifiablePresentationRequest,
} from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVerifiableCredentials } from "@src/ui/hooks/verifiableCredentials";
import { useEthWallet } from "@src/ui/hooks/wallet";

import type { BrowserProvider } from "ethers";

import { usePresentVerifiableCredential } from "../usePresentVerifiableCredential";

const mockCryptkeeperVerifiableCredentials = [
  {
    verifiableCredential: {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: "http://example.edu/credentials/3732",
      type: ["VerifiableCredential"],
      issuer: "did:example:123",
      issuanceDate: new Date("2020-03-10T04:24:12.164Z"),
      credentialSubject: {
        id: "did:example:456",
        claims: {
          type: "BachelorDegree",
          name: "Bachelor of Science and Arts",
        },
      },
    },
    metadata: {
      hash: "0x123",
      name: "Credential #0",
    },
  },
  {
    verifiableCredential: {
      context: ["https://www.w3.org/2018/credentials/v1"],
      id: "http://example.edu/credentials/3733",
      type: ["VerifiableCredential"],
      issuer: "did:example:12345",
      issuanceDate: new Date("2020-03-10T04:24:12.164Z"),
      credentialSubject: {
        id: "did:example:123",
        claims: {
          type: "BachelorDegree",
          name: "Bachelor of Science and Arts",
        },
      },
    },
    metadata: {
      hash: "0x1234",
      name: "Credential #1",
    },
  },
];

jest.mock("@src/ui/hooks/verifiableCredentials", (): unknown => ({
  useCryptkeeperVerifiableCredentials: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  addVerifiableCredential: jest.fn(),
  rejectVerifiableCredentialRequest: jest.fn(),
  renameVerifiableCredential: jest.fn(),
  deleteVerifiableCredential: jest.fn(),
  fetchVerifiableCredentials: jest.fn(),
  useVerifiableCredentials: jest.fn(),
  generateVerifiablePresentation: jest.fn(),
  rejectVerifiablePresentationRequest: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
  useCryptKeeperWallet: jest.fn(),
}));

describe("ui/pages/PresentVerifiableCredential/usePresentVerifiableCredential", () => {
  const mockDispatch = jest.fn();

  const exampleRequest = "exampleRequest";

  const mockProvider = {
    getSigner: () => ({
      signMessage: jest.fn(),
    }),
  } as unknown as BrowserProvider;

  const savedWindow = window;

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useCryptkeeperVerifiableCredentials as jest.Mock).mockReturnValue(mockCryptkeeperVerifiableCredentials);

    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, provider: mockProvider, isActive: true });

    // eslint-disable-next-line no-global-assign
    window = Object.create(window) as Window & typeof globalThis;
    const url = `http://localhost:3000/generate-verifiable-presentation-request?request=${exampleRequest}`;
    Object.defineProperty(window, "location", {
      value: {
        href: url,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();

    // eslint-disable-next-line no-global-assign
    window = savedWindow;
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
      expect(result.current.selectedVerifiableCredentialHashes).toStrictEqual([]);
      expect(result.current.verifiablePresentation).toBe(undefined);
      expect(result.current.error).toBe(undefined);
    });
  });

  test("should close the modal properly", async () => {
    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    act(() => result.current.onCloseModal());

    expect(closePopup).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(2);
  });

  test("should reject a verifiable presentation request", async () => {
    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    await act(async () => Promise.resolve(result.current.onRejectRequest()));

    expect(rejectVerifiablePresentationRequest).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(3);
  });

  test("should toggle selecting a verifiable credential", async () => {
    const hash = "0x123";

    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    act(() => result.current.onToggleSelection(hash));

    expect(result.current.selectedVerifiableCredentialHashes).toStrictEqual([hash]);

    act(() => result.current.onToggleSelection(hash));

    expect(result.current.selectedVerifiableCredentialHashes).toStrictEqual([]);
  });

  test("should confirm selection of verifiable credentials", async () => {
    const hash = "0x123";

    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    act(() => result.current.onConfirmSelection());

    expect(result.current.error).toBe("Please select at least one credential.");

    act(() => result.current.onToggleSelection(hash));
    act(() => result.current.onConfirmSelection());

    expect(result.current.verifiablePresentation?.verifiableCredential?.length).toBe(1);
  });

  test("should return to selection of verifiable credentials", async () => {
    const hash = "0x123";

    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    act(() => result.current.onToggleSelection(hash));
    act(() => result.current.onConfirmSelection());
    act(() => result.current.onReturnToSelection());

    expect(result.current.verifiablePresentation).toBe(undefined);
  });

  test("should connect eth wallet properly", async () => {
    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    await act(async () => Promise.resolve(result.current.onConnectWallet()));

    expect(defaultWalletHookData.onConnect).toBeCalledTimes(1);
  });

  test("should handle error when trying to connect with eth wallet", async () => {
    (useEthWallet as jest.Mock).mockReturnValue({
      ...defaultWalletHookData,
      onConnect: jest.fn(() => Promise.reject()),
    });

    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    await act(async () => Promise.resolve(result.current.onConnectWallet()));

    expect(result.current.error).toBe("Wallet connection error");
  });

  test("should submit verifiable presentation without signature properly", async () => {
    const hash = "0x123";

    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    act(() => result.current.onToggleSelection(hash));
    act(() => result.current.onConfirmSelection());
    await act(async () => Promise.resolve(result.current.onSubmitVerifiablePresentation(false)));

    expect(generateVerifiablePresentation).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(3);
  });

  test("should submit verifiable presentation with signature properly", async () => {
    const hash = "0x123";

    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    act(() => result.current.onToggleSelection(hash));
    act(() => result.current.onConfirmSelection());
    await act(async () => Promise.resolve(result.current.onSubmitVerifiablePresentation(true)));

    expect(generateVerifiablePresentation).toBeCalledTimes(1);
    expect(closePopup).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(3);
  });

  test("should fail to submit an empty verifiable presentation", async () => {
    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    await act(async () => Promise.resolve(result.current.onSubmitVerifiablePresentation(false)));

    expect(generateVerifiablePresentation).toBeCalledTimes(0);
    expect(result.current.error).toBe("Failed to generate Verifiable Presentation.");
  });

  test("should fail to sign a verifiable presentation with an Ethereum connection error", async () => {
    const hash = "0x123";

    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, address: undefined });

    const { result } = renderHook(() => usePresentVerifiableCredential());

    await waitFor(() => {
      expect(result.current.verifiablePresentationRequest).toStrictEqual(exampleRequest);
    });

    act(() => result.current.onToggleSelection(hash));
    act(() => result.current.onConfirmSelection());
    await act(async () => Promise.resolve(result.current.onSubmitVerifiablePresentation(true)));

    expect(generateVerifiablePresentation).toBeCalledTimes(0);
    expect(result.current.error).toBe("Could not connect to Ethereum account.");
  });
});
