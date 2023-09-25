/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { mockDefaultIdentity } from "@src/config/mock/zk";

import RevealIdentityCommitment from "..";
import { IUseRevealIdentityCommitmentData, useRevealIdentityCommitment } from "../useRevealIdentityCommitment";

jest.mock("../useRevealIdentityCommitment", (): unknown => ({
  useRevealIdentityCommitment: jest.fn(),
}));

describe("ui/pages/RevealIdentityCommitment", () => {
  const defaultHookData: IUseRevealIdentityCommitmentData = {
    isLoading: false,
    error: "",
    connectedIdentity: mockDefaultIdentity,
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
