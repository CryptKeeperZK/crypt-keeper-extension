/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import {
  deleteVerifiableCredential,
  fetchVerifiableCredentials,
  renameVerifiableCredential,
} from "@src/ui/ducks/verifiableCredentials";

import { useVerifiableCredentialList } from "../useVerifiableCredentialList";

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

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  addVerifiableCredential: jest.fn(),
  rejectVerifiableCredentialRequest: jest.fn(),
  renameVerifiableCredential: jest.fn(),
  deleteVerifiableCredential: jest.fn(),
  fetchVerifiableCredentials: jest.fn(),
  useVerifiableCredentials: jest.fn(),
  useCryptkeeperVerifiableCredentials: () => mockCryptkeeperVerifiableCredentials,
}));

describe("ui/components/VerifiableCredential/List/useVerifiableCredentialList", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useVerifiableCredentialList());

    expect(result.current.cryptkeeperVerifiableCredentials.length).toEqual(2);
    expect(result.current.cryptkeeperVerifiableCredentials).toEqual(mockCryptkeeperVerifiableCredentials);
  });

  test("should call rename properly", async () => {
    const { result } = renderHook(() => useVerifiableCredentialList());

    await act(async () => result.current.onRenameVerifiableCredential("name", "hash"));

    expect(renameVerifiableCredential).toBeCalledTimes(1);
    expect(fetchVerifiableCredentials).toBeCalledTimes(2);
  });

  test("should call delete properly", async () => {
    const { result } = renderHook(() => useVerifiableCredentialList());

    await act(async () => result.current.onDeleteVerifiableCredential("hash"));

    expect(deleteVerifiableCredential).toBeCalledTimes(1);
    expect(fetchVerifiableCredentials).toBeCalledTimes(2);
  });
});
