/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import General, { IGeneralProps } from "../General";

describe("ui/pages/Settings/components/General", () => {
  const defaultProps: IGeneralProps = {
    isLoading: false,
    settings: { isEnabled: true },
    onEnableHistory: jest.fn(),
    onDeleteHistory: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should disable history properly", async () => {
    const { container, findByTestId } = render(
      <Suspense>
        <General {...defaultProps} />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const checkbox = await findByTestId("keepTrackHistory");
    await act(() => Promise.resolve(checkbox.click()));

    expect(defaultProps.onEnableHistory).toBeCalledTimes(1);
  });

  test("should clear history properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <General {...defaultProps} settings={undefined} />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByText("Clear operation history");
    await act(() => Promise.resolve(button.click()));

    expect(defaultProps.onDeleteHistory).toBeCalledTimes(1);
  });

  test("should render loading state properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <General {...defaultProps} isLoading />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const loading = await findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });
});
