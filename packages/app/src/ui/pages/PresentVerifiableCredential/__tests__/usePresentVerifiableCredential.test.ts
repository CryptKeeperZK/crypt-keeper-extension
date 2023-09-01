/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useCryptkeeperVerifiableCredentials } from "@src/ui/hooks/verifiableCredentials";
import { useEthWallet } from "@src/ui/hooks/wallet";

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
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useEthWallet: jest.fn(),
  useCryptKeeperWallet: jest.fn(),
}));

describe("ui/pages/PresentVerifiableCredential/usePresentVerifiableCredential", () => {
  const mockDispatch = jest.fn();

  const exampleRequest = "exampleRequest";

  const savedWindow = window;

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useCryptkeeperVerifiableCredentials as jest.Mock).mockReturnValue(mockCryptkeeperVerifiableCredentials);

    (useEthWallet as jest.Mock).mockReturnValue({ ...defaultWalletHookData, isActive: true });

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

  test("should close the modal properly", () => {
    const { result } = renderHook(() => usePresentVerifiableCredential());

    act(() => result.current.onCloseModal());

    expect(closePopup).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(2);
  });
});
