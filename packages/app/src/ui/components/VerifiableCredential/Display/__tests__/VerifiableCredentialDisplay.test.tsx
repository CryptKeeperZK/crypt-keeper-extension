/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from "@testing-library/react";

import { useAppDispatch } from "@src/ui/ducks/hooks";

import { VerifiableCredentialDisplay, VerifiableCredentialDisplayProps } from "..";

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

jest.mock("@src/ui/ducks/verifiableCredentials", (): unknown => ({
  addVerifiableCredential: jest.fn(),
  rejectVerifiableCredentialRequest: jest.fn(),
  renameVerifiableCredential: jest.fn(),
  deleteVerifiableCredential: jest.fn(),
  fetchVerifiableCredentials: jest.fn(),
  useVerifiableCredentials: jest.fn(),
}));

describe("ui/components/VerifiableCredential/Display", () => {
  const defaultProps: VerifiableCredentialDisplayProps = {
    cryptkeeperVerifiableCredential: {
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
    onRenameVerifiableCredential: jest.fn(),
  };

  beforeEach(() => {
    (useAppDispatch as jest.Mock).mockReturnValue(jest.fn());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const now = new Date();

    render(
      <VerifiableCredentialDisplay
        {...defaultProps}
        cryptkeeperVerifiableCredential={{
          ...defaultProps.cryptkeeperVerifiableCredential,
          verifiableCredential: {
            ...defaultProps.cryptkeeperVerifiableCredential.verifiableCredential,
            expirationDate: now,
            issuer: {
              id: defaultProps.cryptkeeperVerifiableCredential.verifiableCredential.issuer as string,
            },
          },
        }}
      />,
    );

    const name = await screen.findByText(defaultProps.cryptkeeperVerifiableCredential.metadata.name);
    const type = await screen.findByText(defaultProps.cryptkeeperVerifiableCredential.verifiableCredential.type[0]);
    const issuer = await screen.findByText(
      defaultProps.cryptkeeperVerifiableCredential.verifiableCredential.issuer as string,
    );
    const issuanceDate = await screen.findByText(
      defaultProps.cryptkeeperVerifiableCredential.verifiableCredential.issuanceDate.toString(),
    );
    const expirationDate = await screen.findByText(now.toString());

    expect(name).toBeInTheDocument();
    expect(type).toBeInTheDocument();
    expect(issuer).toBeInTheDocument();
    expect(issuanceDate).toBeInTheDocument();
    expect(expirationDate).toBeInTheDocument();
  });

  test("should render with issuer object properly", async () => {
    render(<VerifiableCredentialDisplay {...defaultProps} />);

    const name = await screen.findByText(defaultProps.cryptkeeperVerifiableCredential.metadata.name);
    const type = await screen.findByText(defaultProps.cryptkeeperVerifiableCredential.verifiableCredential.type[0]);
    const issuer = await screen.findByText(
      defaultProps.cryptkeeperVerifiableCredential.verifiableCredential.issuer as string,
    );
    const issuanceDate = await screen.findByText(
      defaultProps.cryptkeeperVerifiableCredential.verifiableCredential.issuanceDate.toString(),
    );

    expect(name).toBeInTheDocument();
    expect(type).toBeInTheDocument();
    expect(issuer).toBeInTheDocument();
    expect(issuanceDate).toBeInTheDocument();
  });

  test("should rename identity properly", async () => {
    (defaultProps.onRenameVerifiableCredential as jest.Mock).mockResolvedValue(true);

    render(<VerifiableCredentialDisplay {...defaultProps} />);

    const renameIcon = await screen.findByTestId("verifiable-credential-display-toggle-rename");
    fireEvent.click(renameIcon);

    fireEvent.input(screen.getByRole("textbox"), {
      target: {
        value: "My Favorite Credential",
      },
    });

    const submitRenameIcon = await screen.findByTestId("verifiable-credential-display-submit-rename");
    fireEvent.click(submitRenameIcon);

    expect(defaultProps.onRenameVerifiableCredential).toHaveBeenCalledTimes(1);
    expect(defaultProps.onRenameVerifiableCredential).toHaveBeenCalledWith("My Favorite Credential");
  });
});
