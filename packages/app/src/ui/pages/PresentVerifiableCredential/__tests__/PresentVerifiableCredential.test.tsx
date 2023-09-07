/**
 * @jest-environment jsdom
 */

import { IVerifiablePresentation } from "@cryptkeeperzk/types";
import { render, waitFor } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import PresentVerifiableCredential from "../PresentVerifiableCredential";
import { IUsePresentVerifiableCredentialData, usePresentVerifiableCredential } from "../usePresentVerifiableCredential";

jest.mock("../usePresentVerifiableCredential", (): unknown => ({
  ...jest.requireActual("../usePresentVerifiableCredential"),
  usePresentVerifiableCredential: jest.fn(),
}));

describe("ui/pages/PresentVerifiableCredential", () => {
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

  const mockVerifiablePresentation: IVerifiablePresentation = {
    context: ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiablePresentation"],
    verifiableCredential: [
      {
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
    ],
  };

  const defaultHookData: IUsePresentVerifiableCredentialData = {
    isWalletConnected: true,
    isWalletInstalled: true,
    verifiablePresentationRequest: "example presentation request",
    cryptkeeperVerifiableCredentials: mockCryptkeeperVerifiableCredentials,
    selectedVerifiableCredentialHashes: ["0x123"],
    verifiablePresentation: undefined,
    error: undefined,
    onCloseModal: jest.fn(),
    onRejectRequest: jest.fn(),
    onToggleSelection: jest.fn(),
    onConfirmSelection: jest.fn(),
    onReturnToSelection: jest.fn(),
    onConnectWallet: jest.fn(),
    onSubmitVerifiablePresentation: jest.fn(),
  };

  const verifiablePresentationHookData = {
    ...defaultHookData,
    verifiablePresentation: mockVerifiablePresentation,
  };

  beforeEach(() => {
    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render present verifiable credential page properly", async () => {
    (usePresentVerifiableCredential as jest.Mock).mockReturnValue(defaultHookData);

    const { container, findByText } = render(<PresentVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const credentialOne = await findByText(defaultHookData.cryptkeeperVerifiableCredentials[0].metadata.name);
    const credentialTwo = await findByText(defaultHookData.cryptkeeperVerifiableCredentials[1].metadata.name);

    expect(credentialOne).toBeInTheDocument();
    expect(credentialTwo).toBeInTheDocument();
  });

  test("should render a verifiable presentation correctly", async () => {
    (usePresentVerifiableCredential as jest.Mock).mockReturnValue(verifiablePresentationHookData);

    const { container, findByText } = render(<PresentVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const header = await findByText("Sign Verifiable Presentation");
    const metamask = await findByText("Metamask");
    const proceedWithoutSigning = await findByText("Proceed Without Signing");

    expect(header).toBeInTheDocument();
    expect(metamask).toBeInTheDocument();
    expect(proceedWithoutSigning).toBeInTheDocument();
  });
});
