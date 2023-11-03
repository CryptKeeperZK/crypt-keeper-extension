/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { addVerifiableCredential, rejectVerifiableCredentialRequest } from "@src/ui/ducks/verifiableCredentials";
import { useSearchParam } from "@src/ui/hooks/url";
import { hashVerifiableCredential, serializeVerifiableCredential } from "@src/util/credentials";

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

jest.mock("@src/ui/hooks/url", (): unknown => ({
  useSearchParam: jest.fn(),
}));

describe("ui/pages/AddVerifiableCredential/useAddVerifiableCredential", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());

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

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useSearchParam as jest.Mock).mockReturnValue(mockSerializedVerifiableCredential);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
      expect(result.current.error).toBeUndefined();
    });
  });

  test("should return empty credential if there is no search param", async () => {
    (useSearchParam as jest.Mock).mockReturnValue("");

    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.cryptkeeperVerifiableCredential).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  test("should close the modal properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    act(() => {
      result.current.onCloseModal();
    });

    expect(closePopup).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test("should toggle renaming properly", async () => {
    const newName = "a new name";

    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    act(() => {
      result.current.onRenameVerifiableCredential(newName);
    });

    expect(result.current.cryptkeeperVerifiableCredential!.metadata.name).toBe(newName);
  });

  test("should approve the verifiable credential properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => result.current.onApproveVerifiableCredential());

    expect(addVerifiableCredential).toHaveBeenCalledTimes(1);
  });

  test("should reject the verifiable credential properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => Promise.resolve(result.current.onRejectVerifiableCredential()));

    expect(rejectVerifiableCredentialRequest).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  test("should handle an error properly", async () => {
    const error = new Error("Could not add verifiable credential!");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVerifiableCredential).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => result.current.onApproveVerifiableCredential());

    expect(result.current.error).toBe(error.message);
  });
});
