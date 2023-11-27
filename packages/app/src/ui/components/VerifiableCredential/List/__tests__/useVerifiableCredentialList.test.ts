/**
 * @jest-environment jsdom
 */

import { act, renderHook } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";
import { deleteVC, fetchVCs, renameVC } from "@src/ui/ducks/verifiableCredentials";
import { useCryptkeeperVCs } from "@src/ui/hooks/verifiableCredentials";

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

jest.mock("@src/ui/hooks/verifiableCredentials", (): unknown => ({
  useCryptkeeperVCs: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  renameVC: jest.fn(),
  deleteVC: jest.fn(),
  fetchVCs: jest.fn(),
}));

describe("ui/components/VerifiableCredential/List/useVerifiableCredentialList", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useCryptkeeperVCs as jest.Mock).mockReturnValue(mockCryptkeeperVerifiableCredentials);
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return initial data", () => {
    const { result } = renderHook(() => useVerifiableCredentialList());

    expect(result.current.cryptkeeperVCs.length).toEqual(2);
    expect(result.current.cryptkeeperVCs).toEqual(mockCryptkeeperVerifiableCredentials);
  });

  test("should call rename properly", async () => {
    const { result } = renderHook(() => useVerifiableCredentialList());

    await act(async () => result.current.onRename("name", "hash"));

    expect(renameVC).toHaveBeenCalledTimes(1);
    expect(fetchVCs).toHaveBeenCalledTimes(2);
  });

  test("should call delete properly", async () => {
    const { result } = renderHook(() => useVerifiableCredentialList());

    await act(async () => result.current.onDelete("hash"));

    expect(deleteVC).toHaveBeenCalledTimes(1);
    expect(fetchVCs).toHaveBeenCalledTimes(2);
  });
});
