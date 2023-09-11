/**
 * @jest-environment jsdom
 */

import { waitFor, fireEvent, render } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import VerifiablePresentationSigner, { IVerifiablePresentationSignerProps } from "../VerifiablePresentationSigner";

describe("ui/pages/PresentVerifiableCredential/components/VerifiablePresentationSigner", () => {
  const defaultProps: IVerifiablePresentationSignerProps = {
    isWalletConnected: true,
    isWalletInstalled: true,
    cryptkeeperVerifiableCredentials: [
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
    ],
    selectedVerifiableCredentialHashes: ["0x123"],
    onCloseModal: jest.fn(),
    onReturnToSelection: jest.fn(),
    onConnectWallet: jest.fn(),
    onSubmitWithSignature: jest.fn(),
    onSubmitWithoutSignature: jest.fn(),
  };

  beforeEach(() => {
    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(<VerifiablePresentationSigner {...defaultProps} />);

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("sign-verifiable-credential-page");

    expect(page).toBeInTheDocument();
  });

  test("should submit without signing correctly", async () => {
    const { container, findByTestId } = render(<VerifiablePresentationSigner {...defaultProps} />);

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("submit-verifiable-presentation-without-signing");
    fireEvent.click(button);

    expect(defaultProps.onSubmitWithoutSignature).toBeCalledTimes(1);
  });

  test("should submit with signing correctly", async () => {
    const { container, findByTestId } = render(<VerifiablePresentationSigner {...defaultProps} />);

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("sign-verifiable-presentation-metamask");
    fireEvent.click(button);

    expect(defaultProps.onSubmitWithSignature).toBeCalledTimes(1);
  });

  test("should connect to metamask correctly", async () => {
    const { container, findByTestId } = render(
      <VerifiablePresentationSigner {...defaultProps} isWalletConnected={false} />,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("sign-verifiable-presentation-metamask");
    fireEvent.click(button);

    expect(defaultProps.onConnectWallet).toBeCalledTimes(1);
  });

  test("should display install metamask message", async () => {
    const { container, findByText } = render(
      <VerifiablePresentationSigner {...defaultProps} isWalletInstalled={false} />,
    );

    await waitFor(() => container.firstChild !== null);

    const text = await findByText("Install MetaMask");

    expect(text).toBeInTheDocument();
  });
});
