/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import { Advanced, IAdvancedProps } from "..";

describe("ui/pages/Settings/components/Advanced", () => {
  const defaultProps: IAdvancedProps = {
    isLoading: false,
    onDeleteIdentities: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should clear identities properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <Advanced {...defaultProps} />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByText("Delete all identities");
    await act(() => Promise.resolve(button.click()));

    expect(defaultProps.onDeleteIdentities).toBeCalledTimes(1);
  });

  test("should render loading state properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <Advanced {...defaultProps} isLoading />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const loading = await findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });
});
