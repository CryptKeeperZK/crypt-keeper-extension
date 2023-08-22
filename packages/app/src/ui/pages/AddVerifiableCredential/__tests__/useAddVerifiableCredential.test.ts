/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { hashVerifiableCredential, serializeVerifiableCredential } from "@src/background/services/credentials/utils";
import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";

import { defaultVerifiableCredentialName, useAddVerifiableCredential } from "../useAddVerifiableCredential";

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
}));

describe("ui/pages/AddVerifiableCredential/useAddVerifiableCredential", () => {
  const mockDispatch = jest.fn();

  const mockVerifiableCredential = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    id: "http://example.gov/credentials/3732",
    type: ["VerifiableCredential", "UniversityDegreeCredential"],
    issuer: "https://example.edu/issuers/14",
    issuanceDate: new Date("2010-01-01T19:23:24Z"),
    credentialSubject: {
      id: "did:example:ebfeb1f712ebc6f1c276e12ec21",
      claims: {
        type: "BachelorDegree",
        name: "Bachelor of Science and Arts",
      },
    },
  };
  const mockSerializedVerifiableCredential = serializeVerifiableCredential(mockVerifiableCredential);

  const expectedCryptkeeperVerifiableCredential = {
    verifiableCredential: mockVerifiableCredential,
    metadata: {
      hash: hashVerifiableCredential(mockVerifiableCredential),
      name: defaultVerifiableCredentialName,
    },
  };

  const savedWindow = window;

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    // eslint-disable-next-line no-global-assign
    window = Object.create(window) as Window & typeof globalThis;
    const url = `http://localhost:3000/verifiable-credentials?serializedVerifiableCredential=${mockSerializedVerifiableCredential}`;
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
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
      expect(result.current.error).toBe(undefined);
    });
  });

  test("should close the modal properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    act(() => result.current.onCloseModal());

    expect(closePopup).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(1);
  });

  test("should toggle renaming properly", async () => {
    const newName = "a new name";

    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    act(() => result.current.onRenameVerifiableCredential(newName));

    expect(result.current.cryptkeeperVerifiableCredential!.metadata.name).toBe(newName);
  });

  test("should approve the verifiable credential properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => result.current.onApproveVerifiableCredential());

    expect(addVerifiableCredential).toBeCalledTimes(1);
  });

  test("should reject the verifiable credential properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => Promise.resolve(result.current.onRejectVerifiableCredential()));

    expect(rejectVerifiableCredentialRequest).toBeCalledTimes(1);
    expect(mockDispatch).toBeCalledTimes(2);
  });

  test("should handle an error properly", async () => {
    (addVerifiableCredential as jest.Mock).mockImplementation(() => {
      throw new Error("Could not add verifiable credential!");
    });

    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => result.current.onApproveVerifiableCredential());

    expect(result.current.error).toBe("Could not add verifiable credential!");
  });
});
