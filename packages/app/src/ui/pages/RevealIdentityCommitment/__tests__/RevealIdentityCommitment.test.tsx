/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { ZERO_ADDRESS } from "@src/config/const";

import RevealIdentityCommitment from "..";
import { IUseRevealIdentityCommitmentData, useRevealIdentityCommitment } from "../useRevealIdentityCommitment";

jest.mock("react-router-dom", (): unknown => ({
  useNavigate: jest.fn(),
}));

jest.mock("../useRevealIdentityCommitment", (): unknown => ({
  useRevealIdentityCommitment: jest.fn(),
}));

describe("ui/pages/RevealIdentityCommitment", () => {
  const defaultHookData: IUseRevealIdentityCommitmentData = {
    isLoading: false,
    error: "",
    connectedIdentity: {
      commitment: "commitment",
      metadata: {
        account: ZERO_ADDRESS,
        name: "Account #1",
        identityStrategy: "interep",
        groups: [{ id: "1", name: "Group #1", description: "Description #1" }],
        web2Provider: "twitter",
        host: "http://localhost:3000",
      },
    },
    onGoBack: jest.fn(),
    onGoToHost: jest.fn(),
    onReveal: jest.fn(),
  };

  beforeEach(() => {
    (useRevealIdentityCommitment as jest.Mock).mockReturnValue(defaultHookData);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <RevealIdentityCommitment />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const page = await findByTestId("reveal-identity-commitment-page");

    expect(page).toBeInTheDocument();
  });

  test("should render loading state properly", async () => {
    (useRevealIdentityCommitment as jest.Mock).mockReturnValue({ ...defaultHookData, isLoading: true });

    const { container, findByText } = render(
      <Suspense>
        <RevealIdentityCommitment />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const loading = await findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });

  test("should render error state properly", async () => {
    (useRevealIdentityCommitment as jest.Mock).mockReturnValue({ ...defaultHookData, error: "Error" });

    const { container, findByText } = render(
      <Suspense>
        <RevealIdentityCommitment />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const error = await findByText("Error");

    expect(error).toBeInTheDocument();
  });

  test("should render empty state properly", async () => {
    (useRevealIdentityCommitment as jest.Mock).mockReturnValue({ ...defaultHookData, connectedIdentity: undefined });

    const { container, findByText } = render(
      <Suspense>
        <RevealIdentityCommitment />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const emptyContent = await findByText("No connected identity found");

    expect(emptyContent).toBeInTheDocument();
  });
});
