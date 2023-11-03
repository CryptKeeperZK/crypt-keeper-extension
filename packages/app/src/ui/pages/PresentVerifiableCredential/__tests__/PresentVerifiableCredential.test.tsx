/**
 * @jest-environment jsdom
 */

import { fireEvent, render, waitFor } from "@testing-library/react";

import PresentVerifiableCredential from "..";
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

  const defaultHookData: IUsePresentVerifiableCredentialData = {
    isWalletConnected: true,
    isWalletInstalled: true,
    vpRequest: "example presentation request",
    cryptkeeperVCs: mockCryptkeeperVerifiableCredentials,
    selectedVCHashes: ["0x123"],
    error: undefined,
    checkDisabledItem: jest.fn(() => false),
    onCloseModal: jest.fn(),
    onReject: jest.fn(),
    onSelect: jest.fn(),
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    (usePresentVerifiableCredential as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render present verifiable credential page properly", async () => {
    const { container, findByText } = render(<PresentVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const credentialOne = await findByText(defaultHookData.cryptkeeperVCs[0].metadata.name);
    const credentialTwo = await findByText(defaultHookData.cryptkeeperVCs[1].metadata.name);

    expect(credentialOne).toBeInTheDocument();
    expect(credentialTwo).toBeInTheDocument();
  });

  test("should render an error properly", async () => {
    const newError = "My Error";

    (usePresentVerifiableCredential as jest.Mock).mockReturnValueOnce({ ...defaultHookData, error: newError });

    const { container, findByText } = render(<PresentVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const error = await findByText(newError);

    expect(error).toBeInTheDocument();
  });

  test("should display connect to metamask", async () => {
    (usePresentVerifiableCredential as jest.Mock).mockReturnValueOnce({
      ...defaultHookData,
      isWalletConnected: false,
    });

    const { container, findAllByText } = render(<PresentVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const metamask = await findAllByText("Connect to MetaMask");

    expect(metamask[0]).toBeInTheDocument();
  });

  test("should display install metamask", async () => {
    (usePresentVerifiableCredential as jest.Mock).mockReturnValueOnce({
      ...defaultHookData,
      isWalletInstalled: false,
    });

    const { container, findByText } = render(<PresentVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const metamask = await findByText("Install Metamask");

    expect(metamask).toBeInTheDocument();
  });

  test("should reject a verifiable presentation request correctly", async () => {
    const { container, findByTestId } = render(<PresentVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("reject-verifiable-presentation-request");
    fireEvent.click(button);

    expect(defaultHookData.onReject).toHaveBeenCalledTimes(1);
  });

  test("should sign with metamask", async () => {
    const { container, findAllByText, findByTestId } = render(<PresentVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const metamask = await findAllByText("Sign with MetaMask");

    expect(metamask[0]).toBeInTheDocument();

    const button = await findByTestId("dropdown-button");
    fireEvent.click(button);

    expect(defaultHookData.onSubmit).toHaveBeenCalledTimes(1);
  });
});
