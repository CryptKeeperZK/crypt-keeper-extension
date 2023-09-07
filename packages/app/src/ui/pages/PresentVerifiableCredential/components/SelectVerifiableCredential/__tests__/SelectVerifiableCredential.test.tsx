/**
 * @jest-environment jsdom
 */

import { waitFor, fireEvent, render } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import SelectVerifiableCredential, { ISelectVerifiableCredentialProps } from "../SelectVerifiableCredential";

describe("ui/pages/PresentVerifiableCredential/components/SelectVerifiableCredential", () => {
  const defaultProps: ISelectVerifiableCredentialProps = {
    verifiablePresentationRequest: "example presentation request",
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
    error: undefined,
    onCloseModal: jest.fn(),
    onRejectVerifiablePresentationRequest: jest.fn(),
    onToggleSelectVerifiableCredential: jest.fn(),
    onConfirmSelection: jest.fn(),
  };

  beforeEach(() => {
    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render properly", async () => {
    const { container, findByTestId, findByText } = render(<SelectVerifiableCredential {...defaultProps} />);

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("select-verifiable-credential-page");
    const request = await findByText(defaultProps.verifiablePresentationRequest!);
    const item = await findByText(defaultProps.cryptkeeperVerifiableCredentials[0].metadata.name);

    expect(page).toBeInTheDocument();
    expect(request).toBeInTheDocument();
    expect(item).toBeInTheDocument();
  });

  test("should render an error properly", async () => {
    const newError = "My Error";
    const { container, findByText } = render(<SelectVerifiableCredential {...defaultProps} error={newError} />);

    await waitFor(() => container.firstChild !== null);

    const error = await findByText(newError);

    expect(error).toBeInTheDocument();
  });

  test("should reject a verifiable presentation request correctly", async () => {
    const { container, findByTestId } = render(<SelectVerifiableCredential {...defaultProps} />);

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("reject-verifiable-presentation-request");
    fireEvent.click(button);

    expect(defaultProps.onRejectVerifiablePresentationRequest).toBeCalledTimes(1);
  });

  test("should confirm a credential selection correctly", async () => {
    const { container, findByTestId } = render(<SelectVerifiableCredential {...defaultProps} />);

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("confirm-verifiable-presentation-request");
    fireEvent.click(button);

    expect(defaultProps.onConfirmSelection).toBeCalledTimes(1);
  });
});
