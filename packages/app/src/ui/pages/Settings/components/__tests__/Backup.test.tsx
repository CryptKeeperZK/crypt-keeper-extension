/**
 * @jest-environment jsdom
 */

import { act, render, waitFor } from "@testing-library/react";
import { Suspense } from "react";

import Backup, { IBackupProps } from "../Backup";

describe("ui/pages/Settings/components/Backup", () => {
  const defaultProps: IBackupProps = {
    isLoading: false,
    onDeleteIdentities: jest.fn(),
    onGoToBackup: jest.fn(),
    onGoToUploadBackup: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should clear identities properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <Backup {...defaultProps} />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByText("Delete all identities");
    await act(() => Promise.resolve(button.click()));

    expect(defaultProps.onDeleteIdentities).toBeCalledTimes(1);
  });

  test("should download backup data properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <Backup {...defaultProps} />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByText("Download backup");
    await act(() => Promise.resolve(button.click()));

    expect(defaultProps.onGoToBackup).toBeCalledTimes(1);
  });

  test("should go to upload backup data properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <Backup {...defaultProps} />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const button = await findByText("Upload backup");
    await act(() => Promise.resolve(button.click()));

    expect(defaultProps.onGoToUploadBackup).toBeCalledTimes(1);
  });

  test("should render loading state properly", async () => {
    const { container, findByText } = render(
      <Suspense>
        <Backup {...defaultProps} isLoading />
      </Suspense>,
    );

    await waitFor(() => container.firstChild !== null);

    const loading = await findByText("Loading...");

    expect(loading).toBeInTheDocument();
  });
});
