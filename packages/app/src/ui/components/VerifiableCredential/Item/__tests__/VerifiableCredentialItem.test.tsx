/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import { VerifiableCredentialItem, VerifiableCredentialItemProps } from "..";

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
    onRename: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    render(<VerifiableCredentialItem {...defaultProps} />);

    const name = await screen.findByText(defaultProps.metadata.name);

    expect(name).toBeInTheDocument();
  });

  test("should render with issuer object properly", async () => {
    render(
      <VerifiableCredentialItem
        {...defaultProps}
        verifiableCredential={{
          ...defaultProps.verifiableCredential,
          issuer: { id: "123" },
        }}
      />,
    );

    const issuer = await screen.findByText(`Issuer: 123`);

    expect(issuer).toBeInTheDocument();
  });

  test("should render with unknown issuer properly", async () => {
    render(
      <VerifiableCredentialItem
        {...defaultProps}
        verifiableCredential={{
          ...defaultProps.verifiableCredential,
          issuer: { id: "" },
        }}
      />,
    );

    const issuer = await screen.findByText("Issuer: unknown");

    expect(issuer).toBeInTheDocument();
  });

  test("should rename identity properly", async () => {
    (defaultProps.onRename as jest.Mock).mockResolvedValue(true);

    render(<VerifiableCredentialItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    fireEvent.click(menu);

    const renameButton = await screen.findByText("Rename");
    fireEvent.click(renameButton);

    fireEvent.input(screen.getByRole("textbox"), {
      target: {
        value: "My Favorite Credential",
      },
    });

    const submitRenameIcon = await screen.findByTestId("verifiable-credential-row-submit-rename");
    await act(async () => Promise.resolve(submitRenameIcon.click()));

    expect(defaultProps.onRename).toHaveBeenCalledTimes(1);
    expect(defaultProps.onRename).toHaveBeenCalledWith("0x123", "My Favorite Credential");
  });

  test("should accept to delete verifiable credential properly", async () => {
    render(<VerifiableCredentialItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    fireEvent.click(menu);

    const deleteButton = await screen.findByText("Delete");
    fireEvent.click(deleteButton);

    const dangerModal = await screen.findByTestId("danger-modal");

    expect(dangerModal).toBeInTheDocument();

    const dangerModalAccept = await screen.findByTestId("danger-modal-accept");
    await act(async () => Promise.resolve(dangerModalAccept.click()));

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(defaultProps.metadata.hash);
    expect(dangerModal).not.toBeInTheDocument();
  });

  test("should reject to delete verifiable credential properly", async () => {
    render(<VerifiableCredentialItem {...defaultProps} />);

    const menu = await screen.findByTestId("menu");
    fireEvent.click(menu);

    const deleteButton = await screen.findByText("Delete");
    fireEvent.click(deleteButton);

    const dangerModal = await screen.findByTestId("danger-modal");

    expect(dangerModal).toBeInTheDocument();

    const dangerModalReject = await screen.findByTestId("danger-modal-reject");
    await act(async () => Promise.resolve(dangerModalReject.click()));

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(0);
    expect(dangerModal).not.toBeInTheDocument();
  });
});
