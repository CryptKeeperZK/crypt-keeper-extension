/**
 * @jest-environment jsdom
 */

import { act, render, screen } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import { VerifiableCredentialItem, VerifiableCredentialItemProps } from "../Item";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  fetchVerifiableCredentials: jest.fn(),
  useVerifiableCredentials: jest.fn(),
}));

describe("ui/components/VerifiableCredential/Item", () => {
  const defaultProps: VerifiableCredentialItemProps = {
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
    onRenameVerifiableCredential: jest.fn(),
    onDeleteVerifiableCredential: jest.fn(),
  };

  const mockDispatch = jest.fn();

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should render properly", async () => {
    render(<VerifiableCredentialItem {...defaultProps} />);

    const name = await screen.findByText(defaultProps.metadata.name);

    expect(name).toBeInTheDocument();
  });

  test("should accept to delete verifiable credential properly", async () => {
    render(<VerifiableCredentialItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    act(() => {
      menu.click();
    });

    const deleteButton = await screen.findByText("Delete");
    act(() => {
      deleteButton.click();
    });

    const dangerModal = await screen.findByTestId("danger-modal");

    expect(dangerModal).toBeInTheDocument();

    const dangerModalAccept = await screen.findByTestId("danger-modal-accept");
    await act(async () => Promise.resolve(dangerModalAccept.click()));

    expect(defaultProps.onDeleteVerifiableCredential).toBeCalledTimes(1);
    expect(defaultProps.onDeleteVerifiableCredential).toBeCalledWith(defaultProps.metadata.hash);
    expect(dangerModal).not.toBeInTheDocument();
  });

  test("should reject to delete verifiable credential properly", async () => {
    render(<VerifiableCredentialItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    act(() => {
      menu.click();
    });

    const deleteButton = await screen.findByText("Delete");
    act(() => {
      deleteButton.click();
    });

    const dangerModal = await screen.findByTestId("danger-modal");

    expect(dangerModal).toBeInTheDocument();

    const dangerModalreject = await screen.findByTestId("danger-modal-reject");
    await act(async () => Promise.resolve(dangerModalreject.click()));

    expect(defaultProps.onDeleteVerifiableCredential).toBeCalledTimes(0);
    expect(dangerModal).not.toBeInTheDocument();
  });
});
