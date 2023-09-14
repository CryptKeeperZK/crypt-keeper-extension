/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor } from "@testing-library/react";

import { serializeCryptkeeperVC } from "@src/background/services/credentials/utils";
import { useVerifiableCredentials } from "@src/ui/ducks/verifiableCredentials";

import { useCryptkeeperVerifiableCredentials } from "../useCryptkeeperVerifiableCredentials";

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  useVerifiableCredentials: jest.fn(),
}));

describe("ui/hooks/verifiableCredentials", () => {
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

  const mockSerializedVerifiableCredentials = mockCryptkeeperVerifiableCredentials.map(serializeCryptkeeperVC);

  beforeEach(() => {
    (useVerifiableCredentials as jest.Mock).mockReturnValue(mockSerializedVerifiableCredentials);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("it correctly fetches and deserializes verifiable credentials", async () => {
    const { result } = renderHook(() => useCryptkeeperVerifiableCredentials());

    await waitFor(() => {
      expect(result.current).toStrictEqual(mockCryptkeeperVerifiableCredentials);
    });
  });
});
