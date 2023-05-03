/**
 * @jest-environment jsdom
 */

import { act, render, waitFor, screen, fireEvent } from "@testing-library/react";
import { useNavigate } from "react-router-dom";

import { defaultWalletHookData } from "@src/config/mock/wallet";
import { downloadBackup } from "@src/ui/ducks/backup";
import { useAppDispatch } from "@src/ui/ducks/hooks";
import { useWallet } from "@src/ui/hooks/wallet";

import DownloadBackup from "..";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("@src/ui/hooks/wallet", (): unknown => ({
  useWallet: jest.fn(),
}));

jest.mock("@src/ui/ducks/backup", (): unknown => ({
  downloadBackup: jest.fn(),
}));

jest.mock("@src/ui/ducks/hooks", (): unknown => ({
  useAppDispatch: jest.fn(),
}));

describe("ui/pages/DownloadBackup", () => {
  const mockDispatch = jest.fn(() => Promise.resolve());
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue(defaultWalletHookData);

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (downloadBackup as jest.Mock).mockReturnValue("content");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should render properly", async () => {
    const { container } = render(<DownloadBackup />);

    await waitFor(() => container.firstChild !== null);

    const form = await screen.findByTestId("download-backup-page");

    expect(form).toBeInTheDocument();
  });

  test("should handle error properly", async () => {
    const err = new Error("Error");
    (mockDispatch as jest.Mock).mockRejectedValue(err);
    const { container } = render(<DownloadBackup />);

    await waitFor(() => container.firstChild !== null);

    const input = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(input, { target: { value: "password" } })));

    const button = await screen.findByTestId("download-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    const error = await screen.findByText(err.message);
    expect(error).toBeInTheDocument();
  });

  test("should be able to show/hide password", async () => {
    const { container } = render(<DownloadBackup />);

    await waitFor(() => container.firstChild !== null);

    const passwordInput = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(passwordInput, { target: { value: "12345" } })));

    const showButton = await screen.findByText("Show");

    expect(showButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(showButton)));

    const hideButton = await screen.findByText("Hide");

    expect(hideButton).toBeInTheDocument();

    await act(async () => Promise.resolve(fireEvent.click(hideButton)));

    expect(showButton).toBeInTheDocument();
  });

  test("should submit form properly", async () => {
    const { container } = render(<DownloadBackup />);

    await waitFor(() => container.firstChild !== null);

    const input = await screen.findByLabelText("Password");
    await act(async () => Promise.resolve(fireEvent.change(input, { target: { value: "password" } })));

    const button = await screen.findByTestId("download-button");
    await act(async () => Promise.resolve(fireEvent.submit(button)));

    expect(mockDispatch).toBeCalledTimes(1);
  });
});
