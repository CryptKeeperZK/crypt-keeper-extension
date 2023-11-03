/**
 * @jest-environment jsdom
 */

import { act, renderHook, waitFor } from "@testing-library/react";

import { closePopup } from "@src/ui/ducks/app";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { rejectUserRequest } from "@src/ui/ducks/requests";
import { addVC } from "@src/ui/ducks/verifiableCredentials";
import { useSearchParam } from "@src/ui/hooks/url";
import { hashVC, serializeVC } from "@src/util/credentials";

import { defaultVCName, useAddVerifiableCredential } from "../useAddVerifiableCredential";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/app", (): unknown => ({
  closePopup: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  addVC: jest.fn(),
}));

jest.mock("@src/ui/ducks/requests", (): unknown => ({
  rejectUserRequest: jest.fn(),
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
  const mockSerializedVerifiableCredential = serializeVC(mockVerifiableCredential);

  const expectedCryptkeeperVerifiableCredential = {
    verifiableCredential: mockVerifiableCredential,
    metadata: {
      hash: hashVC(mockVerifiableCredential),
      name: defaultVCName,
    },
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useSearchParam as jest.Mock).mockImplementation((arg: string) =>
      arg === "urlOrigin" ? "http://localhost:3000" : mockSerializedVerifiableCredential,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
      expect(result.current.error).toBeUndefined();
    });
  });

  test("should return empty credential if there is no search param", async () => {
    (useSearchParam as jest.Mock).mockReturnValue("");

    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.cryptkeeperVC).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });
  });

  test("should close the modal properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
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
      expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    act(() => {
      result.current.onRename(newName);
    });

    expect(result.current.cryptkeeperVC!.metadata.name).toBe(newName);
  });

  test("should approve the verifiable credential properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => result.current.onApprove());

    expect(addVC).toHaveBeenCalledTimes(1);
  });

  test("should reject the verifiable credential properly", async () => {
    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => Promise.resolve(result.current.onReject()));

    expect(rejectUserRequest).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  test("should handle an error properly", async () => {
    const error = new Error("Could not add verifiable credential!");
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn(() => Promise.reject(error)));

    const { result } = renderHook(() => useAddVerifiableCredential());

    await waitFor(() => {
      expect(result.current.cryptkeeperVC).toStrictEqual(expectedCryptkeeperVerifiableCredential);
    });

    await act(async () => result.current.onApprove());

    expect(result.current.error).toBe(error.message);
  });
});
