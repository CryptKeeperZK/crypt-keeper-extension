/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import { VerifiableCredentialList } from "..";
import { IUseVerifiableCredentialListData, useVerifiableCredentialList } from "../useVerifiableCredentialList";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/components/VerifiableCredential/List/useVerifiableCredentialList", (): unknown => ({
  useVerifiableCredentialList: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  addVerifiableCredential: jest.fn(),
  rejectVerifiableCredentialRequest: jest.fn(),
  renameVerifiableCredential: jest.fn(),
  deleteVerifiableCredential: jest.fn(),
  fetchVerifiableCredentials: jest.fn(),
  useVerifiableCredentials: jest.fn(),
}));

describe("ui/components/VerifiableCredential/List", () => {
  const defaultHookData: IUseVerifiableCredentialListData = {
    cryptkeeperVCs: [
      {
        vc: {
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
        vc: {
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
    ],
    onRename: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());

    (useVerifiableCredentialList as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    render(<VerifiableCredentialList />);

    const nameOne = await screen.findByText(defaultHookData.cryptkeeperVCs[0].metadata.name);
    const nameTwo = await screen.findByText(defaultHookData.cryptkeeperVCs[1].metadata.name);

    expect(nameOne).toBeInTheDocument();
    expect(nameTwo).toBeInTheDocument();
  });

  test("should render properly if there are no verifiable credentials", async () => {
    (useVerifiableCredentialList as jest.Mock).mockReturnValue({
      ...defaultHookData,
      cryptkeeperVCs: [],
    });

    render(<VerifiableCredentialList />);

    const emptyMessage = await screen.findByText("No Verifiable Credentials available");

    expect(emptyMessage).toBeInTheDocument();
  });
});
