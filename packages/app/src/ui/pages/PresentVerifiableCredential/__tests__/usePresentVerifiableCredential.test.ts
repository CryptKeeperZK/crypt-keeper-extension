/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  submitVerifiablePresentation,
  signAndSubmitVerifiablePresentation,
  rejectVerifiablePresentationRequest,
} from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVerifiableCredentials } from "@src/ui/hooks/verifiableCredentials";
import { useCryptKeeperWallet, useEthWallet } from "@src/ui/hooks/wallet";

import type { BrowserProvider } from "ethers";

import { MenuItems, usePresentVerifiableCredential } from "../usePresentVerifiableCredential";

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
  submitVerifiablePresentation: jest.fn(),
  signAndSubmitVerifiablePresentation: jest.fn(),
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

  const oldHref = window.location.href;

  Object.defineProperty(window, "location", {
    value: {
      href: oldHref,
    },
    writable: true,
  });

  describe("basic hook functionality", () => {
    beforeEach(() => {
      (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

      (useCryptkeeperVerifiableCredentials as jest.Mock).mockReturnValue(mockCryptkeeperVerifiableCredentials);

      (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, provider: mockProvider, isActive: true });

      (useCryptKeeperWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

      window.location.href = `http://localhost:3000/generate-verifiable-presentation-request?request=${exampleRequest}`;
    });

    afterEach(() => {
      jest.clearAllMocks();

      window.location.href = oldHref;
    });

    test("should return initial data", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
        expect(result.current.selectedVCHashes).toStrictEqual([]);
        expect(result.current.error).toBe(undefined);
      });
    });

    test("should have no initial data if request is empty", async () => {
      window.location.href = `http://localhost:3000/generate-verifiable-presentation-request`;

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(undefined);
      });
    });

    test("should close the modal properly", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onCloseModal());

      expect(closePopup).toBeCalledTimes(1);
      expect(mockDispatch).toBeCalledTimes(2);
    });

    test("should reject a verifiable presentation request", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
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
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onToggleSelection(hash));

      expect(result.current.selectedVCHashes).toStrictEqual([hash]);

      act(() => result.current.onToggleSelection(hash));

      expect(result.current.selectedVCHashes).toStrictEqual([]);
    });

    test("should erase error after toggling select", async () => {
      const hash = "0x123";

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onMenuItemClick(MenuItems.WITHOUT_SIGNATURE));
      await act(() => result.current.onSubmit());

      act(() => result.current.onToggleSelection(hash));

      expect(result.current.error).toBe(undefined);
    });

    test("should toggle the menu properly", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      expect(result.current.isMenuOpen).toBe(false);

      act(() => result.current.onToggleMenu());

      expect(result.current.isMenuOpen).toBe(true);
    });

    test("should select a menu item properly", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      expect(result.current.menuSelectedIndex).toBe(0);

      act(() => result.current.onMenuItemClick(MenuItems.CRYPTKEEPER));

      expect(result.current.menuSelectedIndex).toBe(1);

      act(() => result.current.onMenuItemClick(MenuItems.WITHOUT_SIGNATURE));

      expect(result.current.menuSelectedIndex).toBe(2);

      act(() => result.current.onMenuItemClick(MenuItems.METAMASK));

      expect(result.current.menuSelectedIndex).toBe(0);
    });

    test("should close the menu properly", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      expect(result.current.isMenuOpen).toBe(false);

      act(() => result.current.onToggleMenu());

      expect(result.current.isMenuOpen).toBe(true);

      act(() => result.current.onToggleMenu());

      expect(result.current.isMenuOpen).toBe(false);
    });

    test("should submit verifiable presentation without signature properly", async () => {
      const hash = "0x123";

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onToggleSelection(hash));
      act(() => result.current.onMenuItemClick(MenuItems.WITHOUT_SIGNATURE));
      await act(() => result.current.onSubmit());

      expect(submitVerifiablePresentation).toBeCalledTimes(1);
      expect(closePopup).toBeCalledTimes(1);
      expect(mockDispatch).toBeCalledTimes(3);
    });

    test("should fail to submit an empty verifiable presentation", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onMenuItemClick(MenuItems.WITHOUT_SIGNATURE));
      await act(() => result.current.onSubmit());

      expect(submitVerifiablePresentation).toBeCalledTimes(0);
      expect(result.current.error).toBe("Please select at least one credential.");
    });

    test("should submit verifiable presentation with cryptkeeper signature properly", async () => {
      const hash = "0x123";

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onToggleSelection(hash));
      act(() => result.current.onMenuItemClick(MenuItems.CRYPTKEEPER));
      await act(() => result.current.onSubmit());

      expect(signAndSubmitVerifiablePresentation).toBeCalledTimes(1);
      expect(closePopup).toBeCalledTimes(1);
      expect(mockDispatch).toBeCalledTimes(3);
    });

    test("should fail to submit an empty verifiable presentation with cryptkeeper", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onMenuItemClick(MenuItems.CRYPTKEEPER));
      await act(() => result.current.onSubmit());

      expect(signAndSubmitVerifiablePresentation).toBeCalledTimes(0);
      expect(result.current.error).toBe("Please select at least one credential.");
    });

    test("should submit verifiable presentation with Metamask signature properly", async () => {
      const hash = "0x123";

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onToggleSelection(hash));
      await act(() => result.current.onSubmit());

      expect(submitVerifiablePresentation).toBeCalledTimes(1);
      expect(closePopup).toBeCalledTimes(1);
      expect(mockDispatch).toBeCalledTimes(3);
    });

    test("should fail to submit an empty verifiable presentation with metamask", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      await act(() => result.current.onSubmit());

      expect(signAndSubmitVerifiablePresentation).toBeCalledTimes(0);
      expect(result.current.error).toBe("Please select at least one credential.");
    });

    test("should create error upon invalid menu index", async () => {
      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onMenuItemClick(3));
      await act(() => result.current.onSubmit());

      expect(submitVerifiablePresentation).toBeCalledTimes(0);
      expect(signAndSubmitVerifiablePresentation).toBeCalledTimes(0);
      expect(result.current.error).toBe("Invalid menu index.");
    });
  });

  describe("wallet connection error", () => {
    beforeEach(() => {
      (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

      (useCryptkeeperVerifiableCredentials as jest.Mock).mockReturnValue(mockCryptkeeperVerifiableCredentials);

      (useEthWallet as jest.Mock).mockReturnValue({
        ...defaultWalletHookData,
        onConnect: () => {
          throw Error("error");
        },
        provider: {
          getSigner: () => undefined,
        },
        isActive: false,
      });

      (useCryptKeeperWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

      window.location.href = `http://localhost:3000/generate-verifiable-presentation-request?request=${exampleRequest}`;
    });

    afterEach(() => {
      jest.clearAllMocks();

      window.location.href = oldHref;
    });

    test("should fail to connect wallet if connection is invalid", async () => {
      const hash = "0x123";

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onToggleSelection(hash));
      await act(() => result.current.onSubmit());

      expect(result.current.error).toStrictEqual("Wallet connection error");
    });
  });

  describe("wallet provider error", () => {
    beforeEach(() => {
      (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

      (useCryptkeeperVerifiableCredentials as jest.Mock).mockReturnValue(mockCryptkeeperVerifiableCredentials);

      (useEthWallet as jest.Mock).mockReturnValue({
        ...defaultWalletHookData,
        provider: {
          getSigner: () => undefined,
        },
        isActive: true,
      });

      (useCryptKeeperWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

      window.location.href = `http://localhost:3000/generate-verifiable-presentation-request?request=${exampleRequest}`;
    });

    afterEach(() => {
      jest.clearAllMocks();

      window.location.href = oldHref;
    });

    test("should fail to submit verifiable presentation if wallet is invalid", async () => {
      const hash = "0x123";

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onToggleSelection(hash));
      await act(() => result.current.onSubmit());

      expect(result.current.error).toStrictEqual("Could not connect to Ethereum account.");
    });
  });

  describe("wallet signer error", () => {
    beforeEach(() => {
      (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

      (useCryptkeeperVerifiableCredentials as jest.Mock).mockReturnValue(mockCryptkeeperVerifiableCredentials);

      (useEthWallet as jest.Mock).mockReturnValue({
        ...defaultWalletHookData,
        provider: {
          getSigner: () => ({
            signMessage: () => {
              throw new Error("error");
            },
          }),
        },
        isActive: true,
      });

      (useCryptKeeperWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

      window.location.href = `http://localhost:3000/generate-verifiable-presentation-request?request=${exampleRequest}`;
    });

    afterEach(() => {
      jest.clearAllMocks();

      window.location.href = oldHref;
    });

    test("should fail to submit verifiable presentation if signing errors", async () => {
      const hash = "0x123";

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onToggleSelection(hash));
      await act(() => result.current.onSubmit());

      expect(result.current.error).toStrictEqual("Failed to sign Verifiable Presentation.");
    });
  });

  describe("cryptkeeper address error", () => {
    beforeEach(() => {
      (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

      (useCryptkeeperVerifiableCredentials as jest.Mock).mockReturnValue(mockCryptkeeperVerifiableCredentials);

      (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, provider: mockProvider, isActive: true });

      (useCryptKeeperWallet as jest.Mock).mockReturnValue({
        ...defaultWalletHookData,
        isActive: true,
        address: undefined,
      });

      window.location.href = `http://localhost:3000/generate-verifiable-presentation-request?request=${exampleRequest}`;
    });

    afterEach(() => {
      jest.clearAllMocks();

      window.location.href = oldHref;
    });

    test("should fail to submit verifiable presentation if cryptkeeper address is invalid", async () => {
      const hash = "0x123";

      const { result } = renderHook(() => usePresentVerifiableCredential());

      await waitFor(() => {
        expect(result.current.vpRequest).toStrictEqual(exampleRequest);
      });

      act(() => result.current.onToggleSelection(hash));
      act(() => result.current.onMenuItemClick(MenuItems.CRYPTKEEPER));
      await act(() => result.current.onSubmit());

      expect(result.current.error).toStrictEqual("Could not connect to Cryptkeeper account.");
    });
  });
});
