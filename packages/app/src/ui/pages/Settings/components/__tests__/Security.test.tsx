/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import Security, { ISecurityProps } from "../Security";

describe("ui/pages/Settings/components/Security", () => {
  const defaultProps: ISecurityProps = {
    isLoading: false,
    onGoToResetPassword: jest.fn(),
    onGoRevealMnemonic: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should go to reset password page properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <Security {...defaultProps} />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("change-password");
    await act(() => Promise.resolve(button.click()));

    expect(defaultProps.onGoToResetPassword).toHaveBeenCalledTimes(1);
  });

  test("should go to reveal mnemonic page properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <Security {...defaultProps} />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByTestId("reveal-mnemonic");
    await act(() => Promise.resolve(button.click()));

    expect(defaultProps.onGoRevealMnemonic).toHaveBeenCalledTimes(1);
  });

  test("should render loading state properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <Security {...defaultProps} isLoading />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const loading = await findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });
});
