/**
 * @jest-environment jsdom
 */

import { VerifiableCredential } from "@cryptkeeperzk/types";
import { render, waitFor } from "@testing-library/react";

import { createModalRoot, deleteModalRoot } from "@src/config/mock/modal";

import AddVerifiableCredential from "..";
import { IUseAddVerifiableCredentialData, useAddVerifiableCredential } from "../useAddVerifiableCredential";

jest.mock("../useAddVerifiableCredential", (): unknown => ({
  ...jest.requireActual("../useAddVerifiableCredential"),
  useAddVerifiableCredential: jest.fn(),
}));

describe("ui/pages/AddVerifiableCredential", () => {
  const verifiableCredential: VerifiableCredential = {
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
  };

  const cryptkeeperVerifiableCredential = {
    verifiableCredential,
    metadata: {
      hash: "0x123",
      name: "Credential #0",
    },
  };

  const defaultHookData: IUseAddVerifiableCredentialData = {
    cryptkeeperVerifiableCredential,
    error: undefined,
    onCloseModal: jest.fn(),
    onRenameVerifiableCredential: jest.fn(),
    onApproveVerifiableCredential: jest.fn(),
    onRejectVerifiableCredential: jest.fn(),
  };

  beforeEach(() => {
    (useAddVerifiableCredential as jest.Mock).mockReturnValue(defaultHookData);

    createModalRoot();
  });

  afterEach(() => {
    jest.clearAllMocks();

    deleteModalRoot();
  });

  test("should render add verifiable credential page properly", async () => {
    const { container, findByTestId } = render(<AddVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("add-verifiable-credential-page");

    expect(page).toBeInTheDocument();
  });

  test("should render an error properly", async () => {
    const error = "Error";

    (useAddVerifiableCredential as jest.Mock).mockReturnValue({
      ...defaultHookData,
      error,
    });

    const { container, findByText } = render(<AddVerifiableCredential />);

    await waitFor(() => container.firstChild !== null);

    const errorMessage = await findByText("Error");

    expect(errorMessage).toBeInTheDocument();
  });
});
